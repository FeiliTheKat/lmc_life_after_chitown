/**
 * 逐招对白选取（PK 中点某招放出剧情对话）。纯函数。
 *
 * 优先用 girl.moveReactions[moveKey] 的真迹 beat；未填则走**中性旁白兜底**——
 * 只描述小猴猫的动作，绝不替猴女郎编台词（避免凭空发明角色口吻）。
 */
import { MOVES } from './moves.data';
import type { DialogueLine, MonkeyGirlDef, MoveKey } from '@/types';

/** 兜底旁白：只描述小猴猫单方面出招，留白给作者真迹替换。 */
const NEUTRAL: Record<MoveKey, string> = {
  money: '〔刷礼物〕小猴猫招呼兄弟们大大方方的把礼物图鉴刷过去。',
  rhetoric: '〔话术〕小猴猫嘴皮子一通输出，硬要把话头接住。',
  singHero: '〔唱歌·英雄〕小猴猫亮出招牌曲目《英雄》，直播老子当耍，猴猫really on top！',
  cashDance: '〔跳抓钱舞〕小猴猫跳起了抓钱舞，两只手朝对面主播的方向捏来捏去。',
  looks: '〔颜值反问〕小猴猫把脸怼上镜头：怎么样，好妹妹，喜欢这种感觉吗？是不是有点痞帅？',
};

/**
 * 取本次出招要放出的对白。
 * @param useIndex 该招在本场已使用次数（0 起）——递进取 beat。
 */
export function moveReactionLines(
  girl: MonkeyGirlDef,
  moveKey: MoveKey,
  useIndex: number,
): DialogueLine[] {
  const beats = girl.moveReactions?.[moveKey];
  if (beats && beats.length > 0) {
    return beats[Math.min(useIndex, beats.length - 1)];
  }
  return [
    { who: 'narration', text: NEUTRAL[moveKey] ?? `小猴猫使出了「${MOVES[moveKey].label}」。` },
  ];
}
