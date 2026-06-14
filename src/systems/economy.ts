/**
 * 资源增减与统一钳制（design §6.1）。
 * 纪律：逻辑层任何资源变动都走这里，禁止散落裸 `+=` 后不钳制。
 * - energy: [0, energyMax]
 * - stress: [0, stressMax]（达 stressMax 的强制停播在 §7.6 / M1 处理，这里只钳）
 * - money:  [0, +∞)（永不为负，配合 canUseMove 金钱守卫）
 * - fans:   [0, +∞)（可超 100000；下限仅防异常连败）
 */
import { balance } from '@/config/balance.config';
import type { GameState, ResourceDelta } from '@/types';

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** 原地钳制 resources（battleEngine 等内部多次扣减后调用）。 */
export function clampResources(r: GameState['resources']): void {
  r.energy = clamp(r.energy, 0, balance.resources.energyMax);
  r.stress = clamp(r.stress, 0, balance.resources.stressMax);
  r.money = Math.max(0, r.money);
  r.fans = Math.max(0, r.fans);
}

/** 不可变地施加资源增量，返回新 state（行动/事件结算用）。 */
export function applyDelta(game: GameState, delta: Partial<ResourceDelta>): GameState {
  const g = structuredClone(game);
  g.resources.energy += delta.energy ?? 0;
  g.resources.money += delta.money ?? 0;
  g.resources.fans += delta.fans ?? 0;
  g.resources.stress += delta.stress ?? 0;
  clampResources(g.resources);
  return g;
}
