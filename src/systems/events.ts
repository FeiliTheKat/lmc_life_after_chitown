/**
 * 事件调度器（design §7.1）。纯函数：输入 GameState，输出选中的事件 / 结算后的新 state。
 * 全部随机用 GameState.rngSeed 派生的种子化 RNG（§4.1），绝不用 Math.random——
 * 保证存档复现/回放一致（单单 5% 掷骰尤其依赖此）。
 *
 * 收工（EVENT_CHECK）时序见 gameLoop.endDay：先记收服（战斗在前），再掷事件。
 */
import { clampResources } from '@/systems/economy';
import { makeRng, type Rng } from '@/systems/rng';
import { ALL_EVENTS } from '@/content/events.data';
import { girlDef } from '@/content/monkeyGirls.data';
import {
  CHURN_TARGET,
  type EventKind,
  type EventTrigger,
  type GameEvent,
  type GameState,
} from '@/types';
import { evalWinConditions } from '@/systems/progression';

// 剧本/流失 > 隐藏内容 > flavor（避免关键事件被氛围事件挤掉，§7.1）
const KIND_PRIORITY: Record<EventKind, number> = { whale: 3, churn: 3, hidden: 2, flavor: 1 };

/** oneShot 已触发标记键。 */
export function firedKey(id: string): string {
  return `ev_fired_${id}`;
}

function hasFired(game: GameState, ev: GameEvent): boolean {
  return ev.oneShot === true && game.flags[firedKey(ev.id)] === true;
}

/** 32-bit 字符串哈希（给 RNG 加 salt，让不同事件/不同天的掷骰相互独立但可复现）。 */
function strHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 从 GameState.rngSeed + salt 派生确定性 RNG（同一存档同一上下文恒等）。 */
export function eventRng(game: GameState, salt: string): Rng {
  return makeRng((game.rngSeed ^ strHash(salt)) >>> 0);
}

/** churn 事件的合法目标：已收服、进常规流失池、非鲸鱼、非隐藏（§7.3/§7.4）。 */
export function eligibleChurnTargets(game: GameState): string[] {
  const out: string[] = [];
  for (const rt of Object.values(game.girls)) {
    if (rt.status !== 'signed') continue;
    const def = girlDef(rt.id);
    if (def.isWhale || def.isHidden || def.inChurnPool !== true) continue;
    out.push(rt.id);
  }
  return out;
}

/** 声明式触发匹配（不含 chance；chance 在 pickEvent 里掷）。 */
export function triggerMatches(trigger: EventTrigger, game: GameState): boolean {
  const day = game.calendar.currentDay;
  if (trigger.minDay !== undefined && day < trigger.minDay) return false;
  if (trigger.maxDay !== undefined && day > trigger.maxDay) return false;
  if (trigger.requireFlags?.some((f) => game.flags[f] !== true)) return false;
  if (trigger.forbidFlags?.some((f) => game.flags[f] === true)) return false;
  if (trigger.requireSignedGirl && game.girls[trigger.requireSignedGirl]?.status !== 'signed') {
    return false;
  }
  if (trigger.requireAllGoalsMet) {
    const w = evalWinConditions(game);
    if (!(w.capturedTen && w.fansReached)) return false; // 注意：不要求 seasonEnded（"提前"达标）
  }
  return true;
}

/** churn 模板绑定到具体目标：替换 {girl} 文案 + outcome 的 CHURN_TARGET 占位。 */
export function bindChurn(ev: GameEvent, game: GameState, rng: Rng): GameEvent {
  const targets = eligibleChurnTargets(game);
  const targetId = targets[Math.floor(rng() * targets.length)];
  const name = girlDef(targetId).name;
  const sub = (s: string | undefined) => s?.replaceAll('{girl}', name);
  return {
    ...ev,
    text: sub(ev.text) ?? ev.text,
    choices: ev.choices?.map((c) => ({
      ...c,
      text: sub(c.text) ?? c.text,
      outcome: {
        ...c.outcome,
        churnGirlId: c.outcome.churnGirlId === CHURN_TARGET ? targetId : c.outcome.churnGirlId,
        text: sub(c.outcome.text),
      },
    })),
  };
}

/**
 * EVENT_CHECK：按声明式 trigger + 种子化 chance 选一个事件（已为 churn 绑定目标）。
 * 优先级：whale/churn > hidden > flavor；同档按定义顺序。无命中返回 null。
 */
export function pickEvent(game: GameState): GameEvent | null {
  const rng = eventRng(game, `pick:${game.calendar.currentDay}`);

  const candidates: GameEvent[] = [];
  for (const ev of ALL_EVENTS) {
    if (hasFired(game, ev)) continue;
    if (!triggerMatches(ev.trigger, game)) continue;
    if (ev.kind === 'churn' && eligibleChurnTargets(game).length === 0) continue;
    // chance 在通过结构匹配后才掷（draw 顺序仅依赖匹配集，确定且稳定）
    if (ev.trigger.chance !== undefined && rng() >= ev.trigger.chance) continue;
    candidates.push(ev);
  }
  if (candidates.length === 0) return null;

  const nonFlavor = candidates
    .filter((e) => e.kind !== 'flavor')
    .sort((a, b) => KIND_PRIORITY[b.kind] - KIND_PRIORITY[a.kind]);
  if (nonFlavor.length > 0) {
    const pick = nonFlavor[0];
    return pick.kind === 'churn' ? bindChurn(pick, game, rng) : pick;
  }

  // flavor：加权随机
  const flavor = candidates.filter((e) => e.kind === 'flavor');
  const total = flavor.reduce((s, e) => s + (e.weight ?? 1), 0);
  let r = rng() * total;
  for (const e of flavor) {
    r -= e.weight ?? 1;
    if (r < 0) return e;
  }
  return flavor[flavor.length - 1] ?? null;
}

/** 让某猴女郎永久流失（计入①不回退 signedCount，失被动产出，图鉴标"已流失"）。 */
function churnGirl(game: GameState, girlId: string): void {
  const rt = game.girls[girlId];
  if (rt && rt.status === 'signed') rt.status = 'churned';
}

/**
 * 结算事件 outcome（不推进天——由 gameLoop 调用方负责进天）。
 * 选项事件传 choiceIndex；无选项叙事事件传 0（无 outcome 即纯叙事）。
 */
export function applyEventOutcome(prev: GameState, event: GameEvent, choiceIndex = 0): GameState {
  const game = structuredClone(prev);
  const outcome = event.choices?.[choiceIndex]?.outcome;
  let resultText = '';

  if (outcome) {
    if (outcome.effects) {
      const d = outcome.effects;
      game.resources.energy += d.energy ?? 0;
      game.resources.money += d.money ?? 0;
      game.resources.fans += d.fans ?? 0;
      game.resources.stress += d.stress ?? 0;
    }
    if (outcome.setFlags) {
      for (const [k, v] of Object.entries(outcome.setFlags)) game.flags[k] = v;
    }
    if (outcome.whaleRetainRoll) {
      // 纯 5% 留存掷骰：玩家投入不改概率（§7.3）。种子化，存档复现一致。
      const rng = eventRng(prev, `whale:${event.id}`);
      const keep = rng() < outcome.whaleRetainRoll.keepChance;
      if (keep) {
        resultText = outcome.whaleRetainRoll.keepText;
      } else {
        churnGirl(game, 'girl_dandan');
        resultText = outcome.whaleRetainRoll.churnText;
      }
      // 掷骰已决出结果，鲸鱼事件 ready flag 落幕
      game.flags.whaleEventReady = false;
    } else if (outcome.churnGirlId) {
      churnGirl(game, outcome.churnGirlId);
    }
    resultText = resultText || outcome.text || '';
  }

  if (event.oneShot) game.flags[firedKey(event.id)] = true;

  clampResources(game.resources);
  const shown = resultText || event.text;
  game.eventLog.push({ day: game.calendar.currentDay, eventId: event.id, text: shown });
  game.flash = outcome?.img ? { text: shown, img: outcome.img } : { text: shown };
  return game;
}
