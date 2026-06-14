/**
 * §5.8 配速回归护栏 —— **按新核心循环重写**（2026-06-13：1 天=精力预算、多动作、自己下播）。
 * 旧"30 行动恰好打平精力"口径已作废。这里用固定种子 + 确定性脚本跑完整赛季，
 * 锁定天循环经济（精力/压力/强制停播/进天）的行为，防平衡或逻辑漂移悄悄改变手感。
 */
import { describe, it, expect } from 'vitest';
import { createStore } from './store';
import { createGameController } from './gameLoop';
import { createInitialGameState } from './initState';
import { ALL_GIRL_IDS } from '@/content/monkeyGirls.data';
import { balance } from '@/config/balance.config';
import type { GameState } from '@/types';

const newGame = (seed: number): GameState =>
  createInitialGameState({ seed, girlIds: ALL_GIRL_IDS, totalDays: 18 });

/**
 * 确定性"自律型"策略（无大秀）：每天在不爆压的前提下尽量看综艺，余力听歌，然后下播。
 * 自律 = 只在 stress + perVariety < stressMax 时看综艺，故不会触发强制停播。
 */
function playDisciplinedSeason(seed: number): GameState {
  const store = createStore(newGame(seed));
  const ctrl = createGameController(store);
  const varietyCost = -balance.actions.variety.energy; // 25
  let guard = 0;
  while (store.getState().phase !== 'ENDING' && guard++ < 1000) {
    const s = store.getState();
    if (s.pendingEvent) {
      ctrl.resolveEvent(0); // 叙事事件兜底解锁（本策略无收服，理论上不会出选项事件）
      continue;
    }
    const r = s.resources;
    if (r.energy >= varietyCost && r.stress + balance.stress.perVariety < balance.resources.stressMax) {
      ctrl.performDailyAction('variety');
    } else if (r.energy >= -balance.actions.listen.energy) {
      ctrl.performDailyAction('listen');
    } else {
      ctrl.endDay();
    }
  }
  return store.getState();
}

describe('§5.8 配速回归护栏（新循环）', () => {
  it('确定性：同种子两次跑出完全一致的终局', () => {
    const a = playDisciplinedSeason(42);
    const b = playDisciplinedSeason(42);
    expect(a.resources).toEqual(b.resources);
    expect(a.calendar.currentDay).toBe(b.calendar.currentDay);
    expect(a.win.result).toBe(b.win.result);
  });

  it('赛季恰好打满 18 天即结算（7/3 硬边界，不被拖过）', () => {
    const end = playDisciplinedSeason(42);
    expect(end.phase).toBe('ENDING');
    expect(end.calendar.currentDay).toBe(end.calendar.totalDays);
    expect(end.calendar.currentDay).toBe(18);
  });

  it('自律看综艺不触发强制停播（压力留头寸 → forcedRestDaysLeft 始终 0）', () => {
    const end = playDisciplinedSeason(7);
    expect(end.calendar.forcedRestDaysLeft).toBe(0);
    expect(end.resources.stress).toBeLessThanOrEqual(balance.resources.stressMax);
  });

  it('积极开播确实涨粉（active play 有效）；无收服 → 未集齐 → LOSE', () => {
    const end = playDisciplinedSeason(42);
    expect(end.resources.fans).toBeGreaterThan(balance.resources.fansStart);
    expect(end.capture.signedCount).toBe(0);
    expect(end.win.result).toBe('LOSE_INCOMPLETE'); // 光涨粉不收服 → 三条件不全
  });

  it('无脑刷综艺则触发强制停播（压力是跨天节流阀，§7.6）', () => {
    const store = createStore(newGame(1));
    const ctrl = createGameController(store);
    // 连刷到爆压：起始 stress 0，+35 三次即 105≥100
    ctrl.performDailyAction('variety');
    ctrl.performDailyAction('variety');
    ctrl.performDailyAction('variety');
    expect(store.getState().calendar.currentDay).toBeGreaterThan(1); // 已被强制收工+停播推进
  });
});
