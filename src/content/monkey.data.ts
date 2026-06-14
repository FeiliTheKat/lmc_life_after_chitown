/**
 * 小猴猫（玩家本人）各场景立绘（design §10）。小猴猫图全局共用，不属于任何女主播。
 * 文件名指向 /pweb，经 content/assets.ts 的 pic() 解析。
 */
import type { SceneKey } from '@/types';

export const MONKEY_PORTRAITS: Record<SceneKey, string[]> = {
  idle: ['lmc_pishuai.webp'],

  reacting: ['lmc_suprise_cam.webp', 'lmc_suprise2.webp', 'lmc_suprise3.webp'],

  won: ['lmc_dance1.webp', 'lmc_baole.webp'],

  lost: ['lmc_ill.webp', 'lmc_ill2.webp'],

  churned: ['lmc_ill.webp', 'lmc_ill2.webp'],
};
