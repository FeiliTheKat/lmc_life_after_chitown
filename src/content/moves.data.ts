/**
 * 大秀 5 个出招按钮（design §4.3）。
 * 唱歌·英雄 与 跳抓钱舞 同属"才艺"类、共享重复衰减（PRD 2.4 / 5.3）。
 * 成本数字取自 balance，不在此写字面量。
 */
import { balance } from '@/config/balance.config';
import type { MoveDef, MoveKey } from '@/types';

const cost = balance.battle.moveCostEnergy;

export const MOVES: Record<MoveKey, MoveDef> = {
  money: {
    key: 'money',
    label: '刷礼物',
    category: '金钱',
    costEnergy: cost.money,
    costMoneyPerUse: balance.moneyMove.costMoneyPerUse,
  },
  rhetoric: {
    key: 'rhetoric',
    label: '话术',
    category: '话术',
    costEnergy: cost.rhetoric,
  },
  singHero: {
    key: 'singHero',
    label: '唱歌·英雄',
    category: '才艺',
    costEnergy: cost.singHero,
    canEnlighten: true, // 仅此招对放敌人歌目标触发感化 ×2
  },
  cashDance: {
    key: 'cashDance',
    label: '跳抓钱舞',
    category: '才艺',
    costEnergy: cost.cashDance,
  },
  looks: {
    key: 'looks',
    label: '颜值反问',
    category: '颜值',
    costEnergy: cost.looks,
  },
};

export const MOVE_KEYS = Object.keys(MOVES) as MoveKey[];
