import { describe, it, expect } from 'vitest';
import {
  advanceDay,
  afterAction,
  endSeason,
  passivePayout,
  checkForcedRest,
  createGameController,
} from './gameLoop';
import { createStore } from './store';
import { createInitialGameState } from './initState';
import { ALL_GIRL_IDS } from '@/content/monkeyGirls.data';
import { balance } from '@/config/balance.config';
import type { GameState } from '@/types';

const newGame = (totalDays?: number): GameState =>
  createInitialGameState({ seed: 1, girlIds: ALL_GIRL_IDS, totalDays });

describe('advanceDay（§3.2）', () => {
  it('day++、精力回满、压力衰减并钳制', () => {
    const g = newGame();
    g.resources.energy = 50;
    g.resources.stress = 5;
    const after = advanceDay(g);
    expect(after.calendar.currentDay).toBe(2);
    expect(after.resources.energy).toBe(balance.resources.energyMax); // 早上回满
    expect(after.resources.stress).toBe(0); // 5 + (-10) 钳到 0
  });
});

describe('afterAction 季末判定', () => {
  it('最后一天行动后 → ENDING；未集齐 10 → LOSE_INCOMPLETE', () => {
    const g = newGame(2);
    g.calendar.currentDay = 2; // 已是末日
    const after = afterAction(g);
    expect(after.phase).toBe('ENDING');
    expect(after.win.ended).toBe(true);
    expect(after.win.result).toBe('LOSE_INCOMPLETE');
  });

  it('非末日行动后 → 进天回 Hub', () => {
    const g = newGame(5);
    const after = afterAction(g);
    expect(after.phase).toBe('DAY_HUB');
    expect(after.calendar.currentDay).toBe(2);
  });
});

describe('核心循环：1天=精力预算、多动作、下播睡觉进天（2026-06-13）', () => {
  it('短赛季：连续「下播睡觉」跑到 ENDING', () => {
    const store = createStore(newGame(3));
    const ctrl = createGameController(store);
    ctrl.endDay(); // day1→2
    ctrl.endDay(); // day2→3
    ctrl.endDay(); // day3 末日 → ENDING
    expect(store.getState().phase).toBe('ENDING');
  });

  it('一天内做多个行动：精力递减、天不变', () => {
    const store = createStore(newGame());
    const ctrl = createGameController(store);
    ctrl.performDailyAction('listen'); // -10
    ctrl.performDailyAction('listen'); // -10
    const s = store.getState();
    expect(s.calendar.currentDay).toBe(1); // 同一天
    expect(s.resources.energy).toBe(balance.resources.energyStart + balance.actions.listen.energy * 2);
  });

  it('下播睡觉 → 进下一天、精力回满', () => {
    const g = newGame();
    g.resources.energy = 20;
    const store = createStore(g);
    createGameController(store).endDay();
    const s = store.getState();
    expect(s.calendar.currentDay).toBe(2);
    expect(s.resources.energy).toBe(balance.resources.energyMax);
    expect(s.phase).toBe('DAY_HUB');
  });

  it('买麦片吃要花钱；没钱不生效', () => {
    const poor = newGame();
    poor.resources.energy = 30;
    poor.resources.money = 0;
    const store = createStore(poor);
    createGameController(store).performDailyAction('cereal');
    expect(store.getState().resources.energy).toBe(30); // 没钱→没吃

    const rich = newGame();
    rich.resources.energy = 30;
    rich.resources.money = 1000;
    const store2 = createStore(rich);
    createGameController(store2).performDailyAction('cereal');
    const s2 = store2.getState();
    expect(s2.resources.energy).toBe(30 + balance.actions.cereal.energy);
    expect(s2.resources.money).toBe(1000 + balance.actions.cereal.moneyBase); // 首次购买用 moneyBase
  });

  it('看综艺爆压 → 强制收工 + 停播（天数跳进）', () => {
    const g = newGame();
    g.resources.stress = 70; // +35 即破 100
    const store = createStore(g);
    createGameController(store).performDailyAction('variety');
    const s = store.getState();
    expect(s.calendar.currentDay).toBeGreaterThan(1); // 当天被强制结束 + 停播推进
    expect(s.resources.stress).toBeLessThan(balance.resources.stressMax); // 已清零并衰减
  });

  it('大秀收服思小捌 → 对话弹窗 → confirmCapture → 计数+1、signed、不进天（当天行动）', () => {
    const store = createStore(newGame());
    const ctrl = createGameController(store);
    ctrl.startBattle('girl_sixiaoba');
    expect(store.getState().battle?.complimentOpen).toBe(true);

    ctrl.battleTurn('looks'); // 70×0.6×2.0 + 50 = 134 ≥ 100 → win
    let s = store.getState();
    expect(s.battle?.result).toBe('win');
    // 赢后进收服前对话弹窗，结果尚未写入
    expect(s.pendingCaptureDialogue).not.toBeNull();
    expect(s.capture.signedCount).toBe(0);
    expect(s.phase).toBe('BATTLE');

    ctrl.confirmCapture(); // 玩家读完对话后确认
    s = store.getState();
    expect(s.capture.signedCount).toBe(1);
    expect(s.girls['girl_sixiaoba'].status).toBe('signed');
    expect(s.calendar.currentDay).toBe(1); // 大秀不结束当天
    expect(s.phase).toBe('DAY_HUB');
    expect(s.pendingCaptureDialogue).toBeNull();
    expect(s.battle).toBeNull(); // confirmCapture 已清 battle
  });

  it('下播认输 = 判负、掉粉、不收服、不进天', () => {
    const store = createStore(newGame());
    const ctrl = createGameController(store);
    ctrl.startBattle('girl_sixiaoba');
    ctrl.fleeBattle();
    const s = store.getState();
    expect(s.battle?.result).toBe('lose');
    expect(s.capture.signedCount).toBe(0);
    expect(s.resources.fans).toBe(balance.resources.fansStart + balance.battle.loseFans);
    expect(s.stats.rhetoricLvl).toBe(balance.stats.rhetoricStart + balance.battle.loseRhetoric);
    expect(s.calendar.currentDay).toBe(1); // 大秀不结束当天
  });
});

describe('被动后宫产出（§4.5）', () => {
  it('已收服 tier1 → 每天 +80金/+10粉；进天累加并计时', () => {
    const g = newGame();
    g.girls['girl_sixiaoba'].status = 'signed';
    g.girls['girl_sixiaoba'].daysSinceSigned = 0;
    expect(passivePayout(g)).toEqual({
      money: balance.payoutByTier[1].moneyPerDay,
      fans: balance.payoutByTier[1].fansPerDay,
    });
    const after = advanceDay(g);
    expect(after.resources.money).toBe(balance.payoutByTier[1].moneyPerDay);
    expect(after.girls['girl_sixiaoba'].daysSinceSigned).toBe(1);
  });

  it('鲸鱼单单：高产期用 whale 档，过期停产', () => {
    const g = newGame();
    g.girls['girl_dandan'].status = 'signed';
    g.girls['girl_dandan'].daysSinceSigned = 0;
    expect(passivePayout(g).money).toBe(balance.whale.payout.moneyPerDay);
    g.girls['girl_dandan'].daysSinceSigned = balance.whale.activeDays; // 高产期过
    expect(passivePayout(g).money).toBe(0);
  });
});

describe('压力强制停播（§7.6）', () => {
  it('压力满 → forcedRestDaysLeft=2、压力清零', () => {
    const g = newGame();
    g.resources.stress = balance.resources.stressMax;
    const after = checkForcedRest(g);
    expect(after.calendar.forcedRestDaysLeft).toBe(balance.stress.overflowRestDays);
    expect(after.resources.stress).toBe(0);
  });

  it('压力未满不触发', () => {
    const g = newGame();
    g.resources.stress = 50;
    expect(checkForcedRest(g).calendar.forcedRestDaysLeft).toBe(0);
  });
});

describe('ASEN 造型购买（§5.4）', () => {
  it('钱够 → 扣 ¥1500、颜值拉满、不消耗当天', () => {
    const g = newGame();
    g.resources.money = balance.asenStyle.cost;
    const store = createStore(g);
    const ctrl = createGameController(store);
    ctrl.buyAsenStyle();
    const s = store.getState();
    expect(s.stats.asenStyle).toBe(true);
    expect(s.resources.money).toBe(0);
    expect(s.calendar.currentDay).toBe(1); // 不消耗天
  });

  it('钱不够 → 不购买', () => {
    const store = createStore(newGame()); // money 0
    createGameController(store).buyAsenStyle();
    expect(store.getState().stats.asenStyle).toBe(false);
  });
});

describe('单单鲸鱼状态机 + EVENT_CHECK 接入（§7.3 / §7.1）', () => {
  const signWhale = (g: GameState, days: number): void => {
    g.girls['girl_dandan'] = {
      id: 'girl_dandan',
      status: 'signed',
      attempts: 0,
      revealedWeakness: [],
      daysSinceSigned: days,
    };
    g.capture.signedCount = 1;
  };

  it('advanceDay：鲸鱼高产期满 → 置 whaleEventReady', () => {
    const g = newGame();
    signWhale(g, balance.whale.activeDays - 1); // 再进一天即满
    expect(advanceDay(g).flags.whaleEventReady).toBe(true);
  });

  it('收工 EVENT_CHECK：whale 选项事件弹窗阻塞、当天不进', () => {
    const g = newGame();
    g.calendar.currentDay = 10;
    signWhale(g, balance.whale.activeDays);
    g.flags.whaleEventReady = true;
    const store = createStore(g);
    const ctrl = createGameController(store);
    ctrl.endDay();
    const s = store.getState();
    expect(s.pendingEvent?.id).toBe('whale_dandan');
    expect(s.calendar.currentDay).toBe(10); // 弹窗阻塞，未进天
  });

  it('resolveEvent：表白挽回结算后进天，单单仍计入①（留/失都不回退）', () => {
    const g = newGame();
    g.calendar.currentDay = 10;
    signWhale(g, balance.whale.activeDays);
    g.flags.whaleEventReady = true;
    const store = createStore(g);
    const ctrl = createGameController(store);
    ctrl.endDay(); // → pendingEvent
    ctrl.resolveEvent(0); // 表白挽回 → 5% 掷骰
    const s = store.getState();
    expect(s.pendingEvent).toBeNull();
    expect(s.calendar.currentDay).toBe(11); // 结算后进天
    expect(s.capture.signedCount).toBe(1); // 不回退
    expect(['signed', 'churned']).toContain(s.girls['girl_dandan'].status);
  });
});

describe('季末结局（§6.2）', () => {
  it('集齐10+粉丝达标+赛季满 → WIN', () => {
    const g = newGame();
    g.capture.signedCount = 10;
    g.resources.fans = balance.resources.fansGoal;
    g.calendar.currentDay = g.calendar.totalDays;
    const e = endSeason(g);
    expect(e.phase).toBe('ENDING');
    expect(e.win.result).toBe('WIN');
  });

  it('未集齐 → LOSE_INCOMPLETE', () => {
    const g = newGame();
    g.calendar.currentDay = g.calendar.totalDays;
    expect(endSeason(g).win.result).toBe('LOSE_INCOMPLETE');
  });
});
