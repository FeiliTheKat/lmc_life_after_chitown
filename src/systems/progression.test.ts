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
  // 难度调参 2026-06-15：门槛随放缓后的粉丝曲线压缩重排（见 balance.tierGate）。
  it('粉丝里程碑边界正确解锁档位', () => {
    expect(fansGateTiers(84999)).toEqual([]); // 低于 8.5 万下限 → 无可挑战
    expect(fansGateTiers(85000)).toEqual([1]); // 开局(9万)即在 tier1 区间内
    expect(fansGateTiers(90000)).toEqual([1]);
    expect(fansGateTiers(90999)).toEqual([1]);
    expect(fansGateTiers(91000)).toEqual([1, 2]); // ~9.1 万解锁 tier2
    expect(fansGateTiers(92500)).toEqual([1, 2, 3]); // ~9.25 万解锁 tier3
    expect(fansGateTiers(94000)).toEqual([1, 2, 3, 4]); // ~9.4 万解锁 tier4
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

  // 回归（死锁 bug 2026-06-15）：上一档有人流失(churned)时，更高 tier 仍须能解锁。
  // 流失的对手不可再 PK，故解锁条件须按"已了结"而非"全部签下"判定，否则永久锁死后续 tier。
  it('上一档有人流失时，更高 tier 仍能解锁（不被死锁）', () => {
    const tier2Ids = ALL_GIRL_IDS.filter((id) => {
      const d = girlDef(id);
      return !d.isHidden && d.tier === 2;
    });
    const tier3 = ALL_GIRL_IDS.map(girlDef).find((d) => !d.isHidden && d.tier === 3)!;
    // 注册全部 tier2 + 目标 tier3，粉丝够解锁 tier3
    const game = createInitialGameState({
      seed: 1,
      girlIds: [...tier2Ids, tier3.id],
      totalDays: 18,
    });
    game.resources.fans = 92500;
    // tier2：除最后一个流失外全部签下
    tier2Ids.forEach((id, i) => {
      game.girls[id].status = i === tier2Ids.length - 1 ? 'churned' : 'signed';
    });
    expect(canChallenge(tier3, game)).toBe(true);

    // 反向：只要还有一个 tier2 未了结(unmet)，tier3 仍被门控锁住
    game.girls[tier2Ids[0]].status = 'unmet';
    expect(canChallenge(tier3, game)).toBe(false);
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
