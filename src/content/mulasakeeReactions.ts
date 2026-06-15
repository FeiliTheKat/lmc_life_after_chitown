/**
 * Mulasakee 文言「孤」腔台词库。
 * - BATTLE 池：与 Mulasakee 本人 PK 时，逐招怼小猴猫（接进战斗对话流，见 sakeeBattleTaunt）。
 *   全程文言端着，正与结尾「21 问」卸下文言改说大白话形成反差。
 * - HUB / 旁观弹窗：sakeeHubComment / sakeeBattleComment（旁观语境，预留）。
 */
import type { DialogueLine } from '@/types';

export type HubTrigger = 'variety' | 'listen' | 'cereal' | 'asenStyle' | 'startBattle' | 'reject';
export type BattleTrigger = 'singHero' | 'rhetoric' | 'money' | 'looks' | 'cashDance' | 'flee';

const HUB: Record<HubTrigger, string[]> = {
  variety: [
    '拷土鸡蛋乎？罢矣，总胜于汝自化为土鸡蛋。',
    '欲借综艺而聚众？洋鸡蛋行土法，亦奇也。',
    '终日观此物，久之恐染其气。',
    '……此等之物，汝亦能观之，亦一能事也。',
  ],

  listen: [
    '听其歌乎？岂以为反复数遍，便可尽知其意？',
    '习艺较观综艺，尚可取也。',
    '……《英雄》一曲，汝可知其录于何处？',
    '听歌可益才艺，善。然不可徒听，当真入其境。',
  ],

  cereal: [
    '食麦片而已？仅此乎？',
    '以麦片续精，以牛乳撑播，善哉，小猴猫。',
    '……麦片价腾而犹购之，执念深矣。',
  ],

  asenStyle: [
    '效其发式，尔等终好借其名耳。',
    '……观之略有其形，然止于形耳。',
    '区区一发式，岂能解万端之患？孤实欲闻之。',
  ],

  startBattle: [
    '大秀既启，且观汝有几分斤两。',
    '既行 PK，宜奋力而战，毋辱其名。',
    '既已连麦，此乃正事，勿复迟疑。',
    '……去罢，孤观汝能支几回。',
  ],

  reject: [
    '孤旁观已久。连麦之时，孤自定夺，非汝所能催。',
    '凡事有时，此亦然。将该做之事做完，再来。',
    '孤自有主张。今日，无意。',
  ],
};

const BATTLE: Record<BattleTrigger, string[]> = {
  singHero: [
    '……以其歌应战，善。然此曲有重，毋使其毁于汝口。',
    '此曲之重，汝果能担之乎？',
    '《英雄》一曲，孤不置评。成败自知。',
    '……歌之，令孤观汝是否真入其境。',
  ],

  rhetoric: [
    '恃话术乎？纵舌灿莲花，亦难掩真患。',
    '言辞悦耳，此亦汝所长也。',
    '专攻言辞，颇善。口舌之功，亦为功也。',
    '……言虽善，终须看汝能否久持。',
  ],

  money: ['金帛既出，人心可复得乎？', '……土鸡蛋之术，汝亦习得矣。'],

  looks: ['借颜面开局，此道未必不可。'],

  cashDance: [
    '跳抓钱舞乎？此举当真耶？',
    '此即汝所谓才艺？……然能博人一笑，亦为一功。',
    '……观汝对“才艺”二字，自有异解。',
  ],

  flee: ['遁矣？孤早知如此。', '认败而退，尚称诚实，胜于强撑。'],
};

let _uid = 0;

export interface SakeeComment {
  text: string;
  context: 'hub' | 'battle';
  uid: number;
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sakeeHubComment(trigger: HubTrigger): SakeeComment {
  return { text: pick(HUB[trigger]), context: 'hub', uid: ++_uid };
}

export function sakeeRejectLine(): string {
  return pick(HUB.reject);
}

export function sakeeBattleComment(trigger: BattleTrigger): SakeeComment {
  return { text: pick(BATTLE[trigger]), context: 'battle', uid: ++_uid };
}

/** 与 Mulasakee 本人 PK 时，逐招的文言怼话（who='girl'，直接接进 battle.dialogue 对话流）。 */
export function sakeeBattleTaunt(trigger: BattleTrigger): DialogueLine {
  return { who: 'girl', text: pick(BATTLE[trigger]) };
}
