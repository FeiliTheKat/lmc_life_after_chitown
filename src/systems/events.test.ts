import { describe, it, expect } from 'vitest';
import {
  triggerMatches,
  pickEvent,
  bindChurn,
  eligibleChurnTargets,
  applyEventOutcome,
  eventRng,
  firedKey,
} from './events';
import { EVENTS_BY_ID } from '@/content/events.data';
import { checkContentInvariants } from '@/systems/contentInvariants';
import { createInitialGameState } from '@/engine/initState';
import { ALL_GIRL_IDS } from '@/content/monkeyGirls.data';
import { balance } from '@/config/balance.config';
import { makeRng } from '@/systems/rng';
import type { GameState } from '@/types';

const newGame = (seed = 1): GameState =>
  createInitialGameState({ seed, girlIds: ALL_GIRL_IDS, totalDays: 18 });

const sign = (g: GameState, id: string): void => {
  g.girls[id] = { id, status: 'signed', attempts: 0, revealedWeakness: [], daysSinceSigned: 0 };
};

describe('triggerMatches（§7.1）', () => {
  it('minDay/maxDay 按 currentDay 卡窗', () => {
    const g = newGame();
    g.calendar.currentDay = 10;
    expect(triggerMatches({ minDay: 15 }, g)).toBe(false);
    expect(triggerMatches({ minDay: 5, maxDay: 12 }, g)).toBe(true);
    expect(triggerMatches({ maxDay: 8 }, g)).toBe(false);
  });

  it('requireFlags 全真 / forbidFlags 任一真则否', () => {
    const g = newGame();
    g.flags.a = true;
    expect(triggerMatches({ requireFlags: ['a'] }, g)).toBe(true);
    expect(triggerMatches({ requireFlags: ['a', 'b'] }, g)).toBe(false);
    expect(triggerMatches({ forbidFlags: ['a'] }, g)).toBe(false);
  });

  it('requireSignedGirl 需该猴女郎已收服', () => {
    const g = newGame();
    expect(triggerMatches({ requireSignedGirl: 'girl_dandan' }, g)).toBe(false);
    sign(g, 'girl_dandan');
    expect(triggerMatches({ requireSignedGirl: 'girl_dandan' }, g)).toBe(true);
  });

  it('requireAllGoalsMet = capturedTen && fansReached（不含 seasonEnded）', () => {
    const g = newGame();
    g.capture.signedCount = 10;
    expect(triggerMatches({ requireAllGoalsMet: true }, g)).toBe(false); // 粉丝没到
    g.resources.fans = balance.resources.fansGoal;
    expect(triggerMatches({ requireAllGoalsMet: true }, g)).toBe(true); // 即便没到 7/4
  });
});

describe('pickEvent 优先级（§7.1：剧本/流失 > 隐藏 > flavor）', () => {
  it('鲸鱼 ready → 必出 whale（无 chance 门，压过 flavor）', () => {
    const g = newGame();
    sign(g, 'girl_dandan');
    g.flags.whaleEventReady = true;
    const picked = pickEvent(g);
    expect(picked?.id).toBe('whale_dandan');
  });

  it('oneShot 已触发 → 不再被选中', () => {
    const g = newGame();
    sign(g, 'girl_dandan');
    g.flags.whaleEventReady = true;
    g.flags[firedKey('whale_dandan')] = true;
    expect(pickEvent(g)?.id).not.toBe('whale_dandan');
  });
});

describe('churn 目标绑定与公平性（§7.4）', () => {
  it('eligibleChurnTargets 仅含已收服 + inChurnPool + 非鲸鱼/隐藏', () => {
    const g = newGame();
    sign(g, 'girl_laohuoji'); // inChurnPool true
    sign(g, 'girl_dandan'); // 鲸鱼，排除
    sign(g, 'girl_sixiaoba'); // inChurnPool 非 true，排除
    expect(eligibleChurnTargets(g)).toEqual(['girl_laohuoji']);
  });

  it('bindChurn 把 {girl} 文案 + CHURN_TARGET 占位绑到具体目标', () => {
    const g = newGame();
    sign(g, 'girl_laohuoji');
    const bound = bindChurn(EVENTS_BY_ID['churn_drama_dm'], g, makeRng(1));
    expect(bound.text).toContain('老火姬');
    expect(bound.text).not.toContain('{girl}');
    const churnChoice = bound.choices!.find((c) => c.outcome.churnGirlId);
    expect(churnChoice!.outcome.churnGirlId).toBe('girl_laohuoji');
  });

  it('每个 churn 事件至少一个无 churnGirlId 的安全 outcome（内容自检）', () => {
    expect(checkContentInvariants()).toEqual([]); // 含 churn 公平性校验
  });
});

describe('applyEventOutcome 结算', () => {
  it('churn outcome → 目标流失、signedCount 不回退（计入①）', () => {
    const g = newGame();
    sign(g, 'girl_laohuoji');
    g.capture.signedCount = 1;
    const bound = bindChurn(EVENTS_BY_ID['churn_drama_dm'], g, makeRng(1));
    const churnIdx = bound.choices!.findIndex((c) => c.outcome.churnGirlId);
    const after = applyEventOutcome(g, bound, churnIdx);
    expect(after.girls['girl_laohuoji'].status).toBe('churned');
    expect(after.capture.signedCount).toBe(1); // 不回退
  });

  it('安全选项不流失（公平兜底：兜底安全选项无 churnGirlId）', () => {
    const g = newGame();
    sign(g, 'girl_laohuoji');
    const bound = bindChurn(EVENTS_BY_ID['churn_drama_dm'], g, makeRng(1));
    const safeIdx = bound.choices!.findIndex((c) => !c.outcome.churnGirlId);
    const after = applyEventOutcome(g, bound, safeIdx);
    expect(after.girls['girl_laohuoji'].status).toBe('signed');
  });

});

describe('单单鲸鱼 5% 留存掷骰（§7.3）', () => {
  const runWhale = (seed: number): GameState => {
    const g = newGame(seed);
    sign(g, 'girl_dandan');
    g.capture.signedCount = 1;
    g.flags.whaleEventReady = true;
    return applyEventOutcome(g, EVENTS_BY_ID['whale_dandan'], 0);
  };

  it('掷骰确定性：同种子两次结果一致（存档可复现）', () => {
    const a = runWhale(12345);
    const b = runWhale(12345);
    expect(a.girls['girl_dandan'].status).toBe(b.girls['girl_dandan'].status);
  });

  it('无论留存/流失，signedCount 都不回退（计入①）', () => {
    const a = runWhale(7);
    expect(a.capture.signedCount).toBe(1);
  });

  it('整体留存率 ≈ 5%（纯掷骰，投入不改概率）', () => {
    let keep = 0;
    const N = 3000;
    for (let s = 1; s <= N; s++) {
      if (runWhale(s).girls['girl_dandan'].status === 'signed') keep++;
    }
    const rate = keep / N;
    expect(rate).toBeGreaterThan(0.02);
    expect(rate).toBeLessThan(0.09); // 5% 附近的宽容护栏
  });

  it('鲸鱼事件结算后清 whaleEventReady 旗', () => {
    expect(runWhale(1).flags.whaleEventReady).toBe(false);
  });
});

describe('eventRng 确定性', () => {
  it('同 state + salt → 同序列；不同 salt → 不同序列', () => {
    const g = newGame(99);
    expect(eventRng(g, 'x')()).toBe(eventRng(g, 'x')());
    expect(eventRng(g, 'x')()).not.toBe(eventRng(g, 'y')());
  });
});
