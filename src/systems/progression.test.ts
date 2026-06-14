import { describe, it, expect } from 'vitest';
import {
  fansGateTiers,
  canChallenge,
  sakeeReady,
  sakeeShowsUp,
  evalWinConditions,
  isVictory,
} from './progression';
import { makeGirl, makeGame } from '@/test/factories';
import { createInitialGameState } from '@/engine/initState';
import { girlDef, ALL_GIRL_IDS } from '@/content/monkeyGirls.data';
import type { GameState } from '@/types';

describe('tier 门控（§6 tierGate / PRD 2.5）', () => {
  it('粉丝里程碑边界正确解锁档位', () => {
    expect(fansGateTiers(90000)).toEqual([]); // 开局 9.0 万，未达 9.1 万门槛
    expect(fansGateTiers(91000)).toEqual([1]); // 9.1 万解锁 tier1
    expect(fansGateTiers(91999)).toEqual([1]);
    expect(fansGateTiers(92000)).toEqual([1, 2]);
    expect(fansGateTiers(95000)).toEqual([1, 2, 3]);
    expect(fansGateTiers(98000)).toEqual([1, 2, 3, 4]);
    expect(fansGateTiers(100000)).toEqual([1, 2, 3, 4]); // 上限落最后档
  });
});

describe('canChallenge（§5.1 / §7.5）', () => {
  it('tier2 在 90k 不可挑战、92k 可挑战', () => {
    const girl = makeGirl({ tier: 2 });
    expect(canChallenge(girl, makeGame({ girls: [girl], resources: { fans: 90000 } }))).toBe(false);
    expect(canChallenge(girl, makeGame({ girls: [girl], resources: { fans: 92000 } }))).toBe(true);
  });

  it('已收服/已流失的不可再挑战', () => {
    const girl = makeGirl({ tier: 1 });
    const game = makeGame({ girls: [girl] });
    game.girls[girl.id].status = 'signed';
    expect(canChallenge(girl, game)).toBe(false);
    game.girls[girl.id].status = 'churned';
    expect(canChallenge(girl, game)).toBe(false);
  });

});

describe('Mulasakee 最后一天空降门控（mulasakee.md 定稿 / §7.5）', () => {
  const sakee = girlDef('girl_hidden_11');
  const dandanId = ALL_GIRL_IDS.find((id) => girlDef(id).isWhale)!;
  const regularId = ALL_GIRL_IDS.find((id) => {
    const d = girlDef(id);
    return !d.isWhale && !d.isHidden;
  })!;
  // 满足空降的"基线终局态"：最后一天 + 粉丝十万 + 收服满10 + 阵容完整
  const endGame = (): GameState => {
    const g = createInitialGameState({ seed: 1, girlIds: ALL_GIRL_IDS, totalDays: 18 });
    g.calendar.currentDay = 18;
    g.resources.fans = 100000;
    g.capture.signedCount = 10;
    return g;
  };

  it('最后一天 + 条件齐全 → 他主动空降，可挑战', () => {
    expect(canChallenge(sakee, endGame())).toBe(true);
    expect(sakeeShowsUp(endGame())).toBe(true);
  });

  it('非最后一天但条件齐全 → 进名单(sakeeReady) 但不接受连麦(canChallenge=false)', () => {
    const g = endGame();
    g.calendar.currentDay = 17;
    expect(sakeeReady(g)).toBe(true); // 出现在名单里
    expect(canChallenge(sakee, g)).toBe(false); // 但点了会被婉拒
  });

  it('常规猴女郎流失 → 连名单都不进（sakeeReady=false）', () => {
    const g = endGame();
    g.girls[regularId].status = 'churned';
    expect(sakeeReady(g)).toBe(false);
  });

  it('粉丝不足十万 → 不空降', () => {
    const g = endGame();
    g.resources.fans = 99999;
    expect(canChallenge(sakee, g)).toBe(false);
  });

  it('收服未满10（没走完单单线）→ 不空降', () => {
    const g = endGame();
    g.capture.signedCount = 9;
    expect(canChallenge(sakee, g)).toBe(false);
  });

  it('有常规猴女郎流失（阵容不完整）→ 不空降', () => {
    const g = endGame();
    g.girls[regularId].status = 'churned';
    expect(canChallenge(sakee, g)).toBe(false);
  });

  it('单单流失豁免：仅单单离开仍可空降', () => {
    const g = endGame();
    g.girls[dandanId].status = 'churned';
    expect(canChallenge(sakee, g)).toBe(true);
  });

  it('已赢下（signed）后不再可挑战', () => {
    const g = endGame();
    g.girls['girl_hidden_11'].status = 'signed';
    expect(canChallenge(sakee, g)).toBe(false);
  });
});

describe('胜利三条件（§6.2 / PRD 1.10）', () => {
  it('三条件同时满足才通关', () => {
    const game = makeGame({ totalDays: 18 });
    game.capture.signedCount = 10;
    game.resources.fans = 100000;
    game.calendar.currentDay = 18;
    const w = evalWinConditions(game);
    expect(w).toEqual({ capturedTen: true, fansReached: true, seasonEnded: true });
    expect(isVictory(game)).toBe(true);
  });

  it('粉丝用判定时刻口径：曾达标但回落则不算', () => {
    const game = makeGame({ totalDays: 18 });
    game.capture.signedCount = 10;
    game.resources.fans = 99500; // 7/4 当下未达
    game.calendar.currentDay = 18;
    expect(isVictory(game)).toBe(false);
  });
});
