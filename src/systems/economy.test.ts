import { describe, it, expect } from 'vitest';
import { applyDelta, clampResources } from './economy';
import { balance } from '@/config/balance.config';
import { makeGame } from '@/test/factories';

describe('资源钳制纪律（§6.1）', () => {
  it('energy 钳到 [0, max]', () => {
    const g = makeGame({ resources: { energy: 90 } });
    expect(applyDelta(g, { energy: +50 }).resources.energy).toBe(balance.resources.energyMax);
    expect(applyDelta(g, { energy: -200 }).resources.energy).toBe(0);
  });

  it('money 永不为负', () => {
    const g = makeGame({ resources: { money: 50 } });
    expect(applyDelta(g, { money: -999 }).resources.money).toBe(0);
  });

  it('fans 可超过 100000（达标后仍可涨）', () => {
    const g = makeGame({ resources: { fans: 99800 } });
    expect(applyDelta(g, { fans: +500 }).resources.fans).toBe(100300);
  });

  it('stress 钳到 [0, max]', () => {
    const g = makeGame({ resources: { stress: 90 } });
    expect(applyDelta(g, { stress: +50 }).resources.stress).toBe(balance.resources.stressMax);
  });

  it('applyDelta 不可变：不改原 state', () => {
    const g = makeGame({ resources: { fans: 90000 } });
    applyDelta(g, { fans: +1000 });
    expect(g.resources.fans).toBe(90000);
  });

  it('clampResources 原地钳制', () => {
    const r = { energy: 999, money: -10, fans: -5, stress: 999, cerealBought: 3 };
    clampResources(r);
    expect(r).toEqual({
      energy: balance.resources.energyMax,
      money: 0,
      fans: 0,
      stress: balance.resources.stressMax,
      cerealBought: 3, // 不参与钳制
    });
  });
});
