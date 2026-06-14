import { describe, it, expect } from 'vitest';
import { balance } from './balance.config';

// 冒烟测试：确认测试链路通 + balance 的 PRD 关键不变量没被手滑改坏。
describe('balance.config 基础不变量', () => {
  it('赛季 18 天、粉丝 9万→10万', () => {
    expect(balance.calendar.totalDays).toBe(18);
    expect(balance.resources.fansStart).toBe(90000);
    expect(balance.resources.fansGoal).toBe(100000);
  });

  it('攻陷阈值 / 反击随 tier 单调递增', () => {
    expect(balance.threshold[1]).toBeLessThan(balance.threshold[4]);
    expect(balance.counter[1]).toBeLessThan(balance.counter[4]);
  });

  it('单单鲸鱼留存率 = 5%', () => {
    expect(balance.whale.retainChance).toBeCloseTo(0.05);
  });
});
