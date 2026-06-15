/**
 * 进度系统：tier 门控 + 胜利三条件判定（design §5.1 / §6.2）。纯函数。
 */
import { balance } from '@/config/balance.config';
import { MONKEY_GIRLS, girlDef } from '@/content/monkeyGirls.data';
import type { GameState, MonkeyGirlDef, WinConditionState } from '@/types';

/** 当前粉丝数对应可挑战的 girl.tier 档位（PRD 2.5 里程碑门控）。 */
export function fansGateTiers(fans: number): readonly number[] {
  const gate = balance.tierGate.find((g) => fans >= g.fansMin && fans < g.fansMax);
  if (gate) return gate.tiers;
  const last = balance.tierGate[balance.tierGate.length - 1];
  // fans ≥ 最高档上限（≥10万）→ 最后一档；低于第一档（<91000）→ 无可挑战
  return fans >= last.fansMin ? last.tiers : [];
}

/** 除单单（鲸鱼自有归宿，流没流都豁免）外，是否无任何常规猴女郎流失（阵容完整）。 */
function sakeeRosterIntact(game: GameState): boolean {
  for (const rt of Object.values(game.girls)) {
    if (rt.status !== 'churned') continue;
    const def = girlDef(rt.id);
    if (def.isWhale || def.isHidden) continue; // 单单流失豁免；隐藏者自身不计
    return false; // 有常规猴女郎流失 → 阵容不完整
  }
  return true;
}

/**
 * Mulasakee（神秘嘉宾·第 11）是否**够格出现在连麦名单**（mulasakee.md 定稿）：
 *  ① 粉丝破十万（fansGoal）② 累计收服满 10（含单单——没连过单单则整条线不触发）
 *  ③ 阵容完整（除单单外无常规猴女郎流失）。
 * 满足即出现在挑战名单——但**平时去连他他不接**（见 sakeeShowsUp），只有最后一天他才接受。
 */
export function sakeeReady(game: GameState): boolean {
  return (
    game.resources.fans >= balance.resources.fansGoal &&
    game.capture.signedCount >= game.capture.requiredTotal &&
    sakeeRosterIntact(game)
  );
}

/** Mulasakee 是否**接受连麦、可开打**：在 sakeeReady 基础上须为赛季最后一天（他主动空降）。 */
export function sakeeShowsUp(game: GameState): boolean {
  return game.calendar.currentDay >= game.calendar.totalDays && sakeeReady(game);
}

/** 上一 tier 所有普通女主播都已了结（签下或流失），才解锁更高 tier。
 *  注意：流失（churned）的对手 canChallenge 里已禁止再 PK，故解锁条件不能要求"全部签下"，
 *  否则一旦在某档流失任意一人，更高 tier 会被永久锁死。"已了结"即视为这条对手线走完。 */
function prevTierResolved(tier: number, game: GameState): boolean {
  if (tier <= 1) return true;
  return MONKEY_GIRLS.filter((g) => !g.isHidden && g.tier === tier - 1).every((g) => {
    const rt = game.girls[g.id];
    // 未登记到本局名单的对手不计入门控；登记的须已了结（签下或流失）
    return rt == null || rt.status !== 'unmet';
  });
}

/** 该猴女郎此刻是否可挑战（门控 + 未收服/未流失）。 */
export function canChallenge(girl: MonkeyGirlDef, game: GameState): boolean {
  const rt = game.girls[girl.id];
  if (rt && rt.status !== 'unmet') return false; // 已收服/已流失，不再 PK
  // 隐藏第 11（Mulasakee）：不靠粉丝门控，只在最后一天满足空降条件时由他主动出现（§7.5）
  if (girl.isHidden) return sakeeShowsUp(game);
  if (!fansGateTiers(game.resources.fans).includes(girl.tier)) return false;
  // 上一 tier 全部了结（签下或流失）才解锁更高 tier
  return prevTierResolved(girl.tier, game);
}

/** 胜利三条件当前状态（§6.2，fansReached 用"判定时刻"口径）。 */
export function evalWinConditions(game: GameState): WinConditionState {
  return {
    capturedTen: game.capture.signedCount >= game.capture.requiredTotal,
    fansReached: game.resources.fans >= balance.resources.fansGoal,
    seasonEnded: game.calendar.currentDay >= game.calendar.totalDays,
  };
}

/** 三条件同时满足才通关（PRD 1.10，结束日期语义 A：须玩满整季）。 */
export function isVictory(game: GameState): boolean {
  const w = evalWinConditions(game);
  return w.capturedTen && w.fansReached && w.seasonEnded;
}

/** 提前达标（7/4 前三条件除 seasonEnded 都满足）→ 开放隐藏内容（§7.5）。 */
export function isEarlyGoalsMet(game: GameState): boolean {
  const w = evalWinConditions(game);
  return w.capturedTen && w.fansReached && !w.seasonEnded;
}
