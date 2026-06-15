/**
 * 4 类日常行动的结算（design §3.3 / PRD 4.3）。纯函数 f(game)=>game。
 * 大秀（与女主播 PK）不在此结算，由 gameLoop 进入战斗子循环。
 */
import { balance } from '@/config/balance.config';
import { applyDelta } from '@/systems/economy';
import { randomAlbum, type AlbumDef } from '@/content/songs.data';
import type { GameState } from '@/types';

export type DailyActionKey = 'variety' | 'listen' | 'cereal';

/** 看综艺（拷打土鸡蛋）：涨粉最快，但压力 +35（过量 → 强制停播，§7.6/M1）。 */
export function resolveVariety(game: GameState): GameState {
  const a = balance.actions.variety;
  // TODO(M1)：fans 用种子化 RNG 加 ±jitter；M0 先用基准值（确定性）。
  return applyDelta(game, { energy: a.energy, fans: a.fans, money: a.money, stress: a.stress });
}

/** 听歌（练 ASEN）：涨粉最慢但安全，才艺 +2。
 *  2026-06-15：随机听到的曲目若标了 noTalent（土鸡蛋曲库）→ 才艺不加分。
 *  album 由调用方传入，确保与反馈 toast 展示的是同一张（默认随机兜底）。 */
export function resolveListen(game: GameState, album: AlbumDef = randomAlbum()): GameState {
  const a = balance.actions.listen;
  const g = applyDelta(game, { energy: a.energy, fans: a.fans, money: a.money });
  if (!album.noTalent) g.stats.talentLvl += a.talent; // stats 非资源，不走 applyDelta
  return g;
}

/** 当前麦片价格（每多买一次涨 priceStep）。 */
export function currentCerealCost(cerealBought: number): number {
  return -balance.actions.cereal.moneyBase + cerealBought * balance.actions.cereal.priceStep;
}

/** 买麦片吃：花钱续精力；价格随购买次数阶梯上涨。买不起则不生效。 */
export function resolveCereal(game: GameState): GameState {
  const a = balance.actions.cereal;
  const bought = game.resources.cerealBought ?? 0;
  const cost = currentCerealCost(bought);
  if (game.resources.money < cost) return game;
  const g = applyDelta(game, { energy: a.energy, money: -cost });
  g.resources.cerealBought = bought + 1;
  return g;
}

export function resolveDailyAction(
  game: GameState,
  key: DailyActionKey,
  album?: AlbumDef,
): GameState {
  switch (key) {
    case 'variety':
      return resolveVariety(game);
    case 'listen':
      return resolveListen(game, album);
    case 'cereal':
      return resolveCereal(game);
  }
}
