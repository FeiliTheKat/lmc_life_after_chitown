/**
 * 天状态机编排（design §3.2）。编排层：调用纯系统、推进相位、管战斗子循环。
 * 核心循环（2026-06-13 重构）：1 天 = 一份精力预算；当天内可做多个行动
 * （看综艺/听歌/买麦片/大秀，各花精力），玩家点「下播睡觉」结束当天 → 进下一天。
 * 压力爆表 = 强制收工 + 停播 N 天。EVENT_CHECK 在收工时插入（M1 批2）。
 */
import { balance } from '@/config/balance.config';
import { clampResources } from '@/systems/economy';
import { resolveDailyAction, type DailyActionKey } from '@/systems/actions';
import { sakeeHubComment, sakeeBattleComment, sakeeBattleTaunt } from '@/content/mulasakeeReactions';
import {
  enterBattle,
  resolveTurn,
  applyBattleResult,
} from '@/systems/battleEngine';
import { evalWinConditions, isVictory } from '@/systems/progression';
import { pickEvent, applyEventOutcome } from '@/systems/events';
import { girlDef } from '@/content/monkeyGirls.data';
import { moveReactionLines } from '@/content/moveReactions';
import { randomAlbum } from '@/content/songs.data';
import type { GameState, MoveKey } from '@/types';
import type { Store } from '@/engine/store';

// ───────────────────────── 纯 helper（导出供测试） ─────────────────────────

/** 已收服后宫的当日被动产出（design §4.5 / §7.3）。鲸鱼高产期用 whale 档，过期停产（等流失事件）。 */
export function passivePayout(game: GameState): { money: number; fans: number } {
  let money = 0;
  let fans = 0;
  for (const rt of Object.values(game.girls)) {
    if (rt.status !== 'signed') continue;
    const def = girlDef(rt.id);
    if (def.isHidden) continue; // 神秘嘉宾（Mulasakee）赢下≠收服，不产出后宫收益
    if (def.isWhale) {
      if ((rt.daysSinceSigned ?? 0) < balance.whale.activeDays) {
        money += balance.whale.payout.moneyPerDay;
        fans += balance.whale.payout.fansPerDay;
      }
      // 高产期过 → 停产（等意外事件结算，§7.3）
    } else {
      const p = def.payout ?? balance.payoutByTier[def.tier];
      money += p.moneyPerDay;
      fans += p.fansPerDay;
    }
  }
  return { money, fans };
}

/** 进天（下播睡觉/强制停播后）：day++、精力回满、压力衰减、被动后宫产出、收服计时。
 *  核心循环 2026-06-13 重构：1 天 = 一份精力预算，早上精力回满 balance.energyMax。 */
export function advanceDay(prev: GameState): GameState {
  const g = structuredClone(prev);
  g.calendar.currentDay += 1;
  g.resources.energy = balance.resources.energyMax; // 早上精力回满（每天一份预算）
  g.resources.stress += balance.stress.idleDecay; // 负值，闲置衰减
  const pay = passivePayout(g);
  g.resources.money += pay.money;
  g.resources.fans += pay.fans;
  for (const rt of Object.values(g.girls)) {
    if (rt.status === 'signed') rt.daysSinceSigned = (rt.daysSinceSigned ?? 0) + 1;
  }
  markWhaleEventReady(g); // 鲸鱼高产期满 → 置位，收工时触发 whale 意外事件（§7.3）
  clampResources(g.resources);
  return g;
}

/** 鲸鱼（单单）状态机：高产期满（daysSinceSigned ≥ activeDays）且仍在产出 → 置 whaleEventReady。
 *  whale 事件 oneShot，结算后清旗（events.applyEventOutcome）；流失后 status 守卫自动停产。 */
function markWhaleEventReady(g: GameState): void {
  for (const rt of Object.values(g.girls)) {
    if (rt.status !== 'signed') continue;
    if (!girlDef(rt.id).isWhale) continue;
    if ((rt.daysSinceSigned ?? 0) >= balance.whale.activeDays) g.flags.whaleEventReady = true;
  }
}

/** 压力爆表 → 强制停播 N 天（design §7.6）：置 forcedRestDaysLeft、压力清零。在产生压力的行动结算后调用。 */
export function checkForcedRest(prev: GameState): GameState {
  if (prev.resources.stress < balance.resources.stressMax) return prev;
  const g = structuredClone(prev);
  g.calendar.forcedRestDaysLeft = balance.stress.overflowRestDays;
  g.resources.stress = 0;
  return g;
}

/** 自动推进强制停播日：无行动、无事件，仅照常被动产出/恢复（design §7.6）。 */
export function runForcedRest(prev: GameState): GameState {
  let g = prev;
  while (g.calendar.forcedRestDaysLeft > 0 && !g.win.ended) {
    g = structuredClone(g);
    g.calendar.forcedRestDaysLeft -= 1;
    g = afterAction(g); // 推进一天或季末结算
  }
  return g;
}

/** 季末结算：写 win 条件、定结局。 */
export function endSeason(prev: GameState): GameState {
  const g = structuredClone(prev);
  g.win.conditions = evalWinConditions(g);
  g.win.ended = true;
  g.phase = 'ENDING';
  g.win.result = isVictory(g) ? 'WIN' : 'LOSE_INCOMPLETE';
  return g;
}

/**
 * 收工进天（玩家下播睡觉 / 强制停播触发）：
 * 若当前已是赛季最后一天 → 季末结算；否则进天、回 Hub。
 * （EVENT_CHECK 在此插入，M1 批2 实现。）
 */
export function afterAction(prev: GameState): GameState {
  if (prev.calendar.currentDay >= prev.calendar.totalDays) {
    return endSeason(prev);
  }
  const g = advanceDay(prev);
  g.phase = 'DAY_HUB';
  g.win.conditions = evalWinConditions(g);
  return g;
}

// ───────────────────────── 行动反馈（toast） ─────────────────────────

function deltaSummary(before: GameState, after: GameState): string {
  const parts: string[] = [];
  const push = (label: string, d: number) => {
    if (d) parts.push(`${label} ${d >= 0 ? '+' : ''}${d}`);
  };
  push('粉丝', after.resources.fans - before.resources.fans);
  push('金钱', after.resources.money - before.resources.money);
  push('精力', after.resources.energy - before.resources.energy);
  push('压力', after.resources.stress - before.resources.stress);
  push('才艺', after.stats.talentLvl - before.stats.talentLvl);
  return parts.join('、');
}

/** 行动反馈文案（作者给的反馈词 2026-06-13）。 */
function buildActionFlash(
  key: DailyActionKey,
  before: GameState,
  after: GameState,
  overflow: boolean,
): { text: string } {
  let flavor: string;
  switch (key) {
    case 'variety':
      flavor = overflow
        ? `小猴猫被土出了胸闷，不得不下播停播 ${balance.stress.overflowRestDays} 天！`
        : after.resources.stress >= 70
          ? '压力过大，小猴猫快被土出内伤了！'
          : '小猴猫看了一会儿土鸡蛋综艺，引了一大波流！';
      break;
    case 'listen': {
      const a = randomAlbum();
      flavor = `小猴猫打开《${a.title}》（${a.artist}），大大方方地享受起来。`;
      break;
    }
    case 'cereal':
      flavor = `小猴猫狂炫牛奶麦片，精力增加了 ${after.resources.energy - before.resources.energy}！`;
      break;
  }
  const sum = deltaSummary(before, after);
  return { text: sum ? `${flavor}\n${sum}` : flavor };
}

// ───────────────────────── 控制器（操作 store） ─────────────────────────

export interface GameController {
  startGame(): void;
  /** 当天内做一个行动（看综艺/听歌/买麦片）。不结束当天——只花精力/资源。 */
  performDailyAction(key: DailyActionKey): void;
  /** 下播睡觉：先跑 EVENT_CHECK（收工掷事件）；选项事件弹窗阻塞，否则直接进下一天/季末结算。 */
  endDay(): void;
  /** 响应当前 pendingEvent 的某个选项（无选项事件传 0）→ 结算 outcome → 接着进天。 */
  resolveEvent(choiceIndex: number): void;
  startBattle(girlId: string): void;
  /** 没到时候去连 Mulasakee → 他不接受连麦邀请，弹提示 toast（不进战斗）。 */
  rejectSakee(): void;
  battleTurn(moveKey: MoveKey): void;
  /** 读完收服前对话弹窗后确认：写入收服结果、清弹窗、回 Hub。 */
  confirmCapture(): void;
  /** 玩家主动下播/认输 = 立即判负，吃与精力耗尽同样的 LOSE 惩罚（作者已定，2026-06-13）。 */
  fleeBattle(): void;
  /** 剪 ASEN 造型：花 ¥1500 把颜值拉满 100（design §5.4），一次性、不消耗当天。 */
  buyAsenStyle(): void;
  /** 清掉行动反馈 toast。 */
  clearFlash(): void;
  /** 清掉 Mulasakee 旁观弹窗。 */
  clearMulasakeeComment(): void;
  /** 战斗结果展示后清掉 overlay（结果已在 battleTurn/fleeBattle 落库、天已推进）。 */
  clearBattle(): void;
}

export function createGameController(store: Store<GameState>): GameController {
  const get = () => store.getState();

  return {
    startGame() {
      store.setState({ ...get(), phase: 'DAY_HUB' });
    },

    performDailyAction(key) {
      const before = get();
      let g = resolveDailyAction(before, key);
      if (g === before) return; // 没生效（如买不起麦片）
      const overflow = g.resources.stress >= balance.resources.stressMax;
      g.flash = buildActionFlash(key, before, g, overflow);
      g.mulasakeeComment = sakeeHubComment(key);
      // 一天内可做多个行动、不进天；只有压力爆表才强制结束当天 + 停播
      if (overflow) {
        g = checkForcedRest(g); // 置 forcedRestDaysLeft、压力清零
        g = afterAction(g); // 强制收工（结束当天）
        g = runForcedRest(g); // 自动推进停播日
      }
      store.setState(g);
    },

    endDay() {
      const g0 = get();
      // 末日：直接季末结算，不再掷事件（最终结局在 7/4，§7.5）。
      if (g0.calendar.currentDay >= g0.calendar.totalDays) {
        store.setState(endSeason(g0));
        return;
      }
      // EVENT_CHECK：收工掷一个事件（先记收服[战斗已在前]，再掷事件，§7.1）。
      const picked = pickEvent(g0);
      if (picked && picked.choices && picked.choices.length > 0) {
        // 选项事件 → 弹窗阻塞，待 resolveEvent 结算后再进天。
        store.setState({ ...g0, pendingEvent: picked });
        return;
      }
      // 无事件 / 无选项叙事事件：即时结算（写 eventLog/flash），随即进天。
      const settled = picked ? applyEventOutcome(g0, picked, 0) : g0;
      store.setState(runForcedRest(afterAction(settled)));
    },

    resolveEvent(choiceIndex) {
      const g0 = get();
      if (!g0.pendingEvent) return;
      const settled = applyEventOutcome(g0, g0.pendingEvent, choiceIndex);
      settled.pendingEvent = null;
      // 事件结算后接着进天（pendingEvent 只在收工掷出，故必随之进天，§7.1）。
      store.setState(runForcedRest(afterAction(settled)));
    },

    startBattle(girlId) {
      const g = get();
      const battle = enterBattle(g, girlDef(girlId));
      store.setState({ ...g, phase: 'BATTLE', battle, mulasakeeComment: sakeeHubComment('startBattle') });
    },

    rejectSakee() {
      // 平时小猴猫主动连 Mulasakee → 他不接（最后一天他才主动来，见 progression.sakeeShowsUp）
      store.setState({
        ...get(),
        flash: { text: 'Mulasakee 瞥了一眼你发去的连麦邀请，没接。\n「……时候未到。」' },
      });
    },

    battleTurn(moveKey) {
      const g0 = get();
      if (!g0.battle || g0.battle.result) return; // 无战斗或已分胜负 → 忽略
      const girl = girlDef(g0.battle.girlId);
      const r = resolveTurn(g0.battle, g0, girl, moveKey);
      if (!r.changed) return; // 守卫未过（精力/金钱不足）

      // 逐招对白：按该招本场使用次数取 beat，追加到实时对话流（UI 逐字播）。
      const useIndex = r.battle.moveUses?.[moveKey] ?? 0;
      r.battle.moveUses = { ...r.battle.moveUses, [moveKey]: useIndex + 1 };
      r.battle.dialogue = [
        ...(r.battle.dialogue ?? []),
        ...moveReactionLines(girl, moveKey, useIndex),
        // Mulasakee（神秘嘉宾）PK：逐招补一句文言「孤」腔怼话，全程端着——
        // 正与结尾「21 问」卸下文言改说大白话形成反差（mulasakee.md 定稿）。
        ...(girl.isHidden ? [sakeeBattleTaunt(moveKey)] : []),
      ];

      const comment = sakeeBattleComment(moveKey);
      if (r.battle.result === 'win') {
        // 收服前弹窗：显示全对话供观众阅读，玩家点"收服"后再写入结果（design §5.6 pre-capture）。
        const dialogue = girl.winDialogue ?? [{ who: 'narration' as const, text: girl.captureScript }];
        store.setState({
          ...r.game,
          phase: 'BATTLE',
          battle: r.battle,
          mulasakeeComment: comment,
          pendingCaptureDialogue: { girlId: girl.id, dialogue, battle: r.battle },
        });
      } else if (r.battle.result === 'lose') {
        // 失败：立即结算，保留 finished battle 供结果 overlay
        const settled = applyBattleResult(r.game, r.battle, girl);
        store.setState({ ...settled, phase: 'DAY_HUB', battle: r.battle, mulasakeeComment: comment });
      } else {
        store.setState({ ...r.game, battle: r.battle, phase: 'BATTLE', mulasakeeComment: comment });
      }
    },

    confirmCapture() {
      const g0 = get();
      if (!g0.pendingCaptureDialogue) return;
      const { battle } = g0.pendingCaptureDialogue;
      const girl = girlDef(battle.girlId);
      // applyBattleResult 内部已将 game.battle = null
      const settled = applyBattleResult(
        { ...g0, pendingCaptureDialogue: null },
        battle,
        girl,
      );
      store.setState({ ...settled, phase: 'DAY_HUB' });
    },

    fleeBattle() {
      const g0 = get();
      if (!g0.battle || g0.battle.result) return; // 无战斗或已分胜负 → 忽略
      const girl = girlDef(g0.battle.girlId);
      // 认输 = LOSE：沿用 battleTurn 的失败收尾（已试出的喜好 revealedThisBattle 照常写回）
      const battle: typeof g0.battle = {
        ...g0.battle,
        result: 'lose',
        fled: true,
        display: { monkeyScene: 'lost', girlScene: 'lost' },
      };
      const settled = applyBattleResult(g0, battle, girl);
      store.setState({ ...settled, phase: 'DAY_HUB', battle, mulasakeeComment: sakeeBattleComment('flee') });
    },

    buyAsenStyle() {
      const g = get();
      if (g.stats.asenStyle || g.resources.money < balance.asenStyle.cost) return;
      const next = structuredClone(g);
      next.resources.money -= balance.asenStyle.cost;
      next.stats.asenStyle = true;
      clampResources(next.resources);
      next.flash = { text: '小猴猫剪了个 ASEN 的造型！颜值拉满了！', img: 'lmc_asen.webp' };
      next.mulasakeeComment = sakeeHubComment('asenStyle');
      store.setState(next);
    },

    clearFlash() {
      store.setState({ ...get(), flash: null });
    },

    clearMulasakeeComment() {
      store.setState({ ...get(), mulasakeeComment: null });
    },

    clearBattle() {
      store.setState({ ...get(), battle: null });
    },
  };
}
