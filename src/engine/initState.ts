/**
 * 初始 GameState 工厂（design §4.1）。M0.4 gameLoop / 重开 / 测试共用。
 */
import { balance } from '@/config/balance.config';
import type { GameState, MonkeyGirlRuntime } from '@/types';

export const SCHEMA_VERSION = 1;

export interface NewGameOptions {
  seed?: number;
  girlIds?: string[]; // 注册哪些猴女郎的运行时槽（来自 monkeyGirls.data 的 id）
  totalDays?: number; // M0 可传 5 跑短赛季；默认取 balance（30）
}

export function createInitialGameState(opts: NewGameOptions = {}): GameState {
  const { seed = Date.now() >>> 0, girlIds = [], totalDays = balance.calendar.totalDays } = opts;

  const girls: Record<string, MonkeyGirlRuntime> = {};
  for (const id of girlIds) {
    girls[id] = { id, status: 'unmet', attempts: 0, revealedWeakness: [] };
  }

  return {
    version: SCHEMA_VERSION,
    rngSeed: seed,
    phase: 'TITLE', // 新局从封面进入；点"开始游戏"切 DAY_HUB
    calendar: {
      startDate: balance.calendar.startDate,
      endDate: balance.calendar.endDate,
      currentDay: 1,
      totalDays,
      forcedRestDaysLeft: 0,
    },
    resources: {
      energy: balance.resources.energyStart,
      money: balance.resources.moneyStart,
      fans: balance.resources.fansStart,
      stress: 0,
      cerealBought: 0,
    },
    stats: {
      rhetoricLvl: balance.stats.rhetoricStart,
      talentLvl: balance.stats.talentStart,
      looksBase: balance.stats.looksBaseStart,
      asenStyle: false,
    },
    capture: { signedCount: 0, requiredTotal: balance.capture.requiredTotal },
    girls,
    flags: {},
    flash: null,
    pendingWhaleResult: null,
    pendingRivalRescue: null,
    dayStartSnapshot: null,
    eventLog: [],
    pendingEvent: null,
    battle: null,
    win: {
      conditions: { capturedTen: false, fansReached: false, seasonEnded: false },
      ended: false,
    },
  };
}
