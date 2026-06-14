/**
 * 可种子化随机数（design §3.3 / §4.1）。
 * 数值平衡与 bug 复现、单单 5% 掷骰都用它，绝不用 Math.random（不可复现）。
 */

/** mulberry32：32-bit 种子 → 确定性 [0,1) 序列。 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export function makeRng(seed: number): Rng {
  return mulberry32(seed);
}

/** 掷一个概率 p∈[0,1] 的成败。 */
export function rollChance(rng: Rng, p: number): boolean {
  return rng() < p;
}

/** 闭区间 [min,max] 的随机整数。 */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}
