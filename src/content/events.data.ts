/**
 * 事件库（design §7.1–7.5 / PRD 1.11 / 3.3 / 4.6）。声明式 GameEvent，调度器在
 * 收工（EVENT_CHECK）时按 trigger 选事件。本批文案多为占位（M1 批2 允许），
 * 但 **单单（鲸鱼）弧光用 girls/dandan.md 真迹定稿台词**。
 *
 * 纪律：① 绝不出现"抽象"二字（canon 硬规则）；② 每个 churn 事件至少一个 outcome
 * 无 churnGirlId（§7.4 公平性，contentInvariants 校验）；③ 鲸鱼掷骰用种子化 RNG。
 *
 * 占位符：churn 模板的目标用 `{girl}`（文案）+ `CHURN_TARGET`（outcome.churnGirlId），
 * bind 时替换为随机选中的已收服猴女郎。
 */
import { CHURN_TARGET, type GameEvent } from '@/types';

// ───────────────────────── flavor · 碎片涌现叙事（纯叙事，无数值） ─────────────────────────

const _FLAVOR_RAW = [
  {
    id: 'flavor_danmu_freestyle',
    kind: 'flavor' as const,
    weight: 1,
    text: ' 【猴结晶转发了视频】：【深度】科比真的是强奸犯吗？那句著名的”沙克也干了”，究竟藏着什么秘密？',
  },
  {
    id: 'flavor_danmu_freestyle2',
    kind: 'flavor' as const,
    weight: 1,
    text: ' 【猴圣地分享了直播】：这个绝对爆，找个挂件，进来直接开胸炮 ',
  },
  {
    id: 'flavor_carti_bro',
    kind: 'flavor' as const,
    weight: 1,
    text: '【新的私信消息】：黄九日: 小猴猫，听说你回国了？送你票，来广州看我的演出，我想和你聊聊说唱。 ',
  },
  {
    id: 'flavor_okun_video',
    kind: 'flavor' as const,
    weight: 1,
    text: '【新的未读消息】：O坤哥发来祝福: 小猴猫，我祝你星途璀璨。',
  },
];

const FLAVOR: GameEvent[] = _FLAVOR_RAW.map((e) => ({
  ...e,
  trigger: { chance: 1 / _FLAVOR_RAW.length },
}));

// ───────────────────────── churn · 常规流失（公平可避，§7.4） ─────────────────────────

const CHURN: GameEvent[] = [
  {
    id: 'churn_drama_dm',
    kind: 'churn',
    trigger: { minDay: 15, chance: 0.4 },
    oneShot: false,
    text: ' {girl}和你连麦的过程中讲：她直播间被一拨黑粉刷屏带节奏，心态崩了，想退网。你怎么帮她？',
    choices: [
      {
        // 安全选项·话术解锁（§7.4：达等级标"明显更安全"）
        text: '〔话术〕让她别看弹幕，只盯着你聊天',
        gatedByRhetoricLvl: 12,
        outcome: {
          effects: { fans: 200 },
          text: '{girl}一直盯着弹幕，越看越委屈。你急了：“你能不能把聊天重心放我这儿，别老看弹幕？”然后陪她聊了半天乱七八糟的。等回过神来，黑粉已经走光了。',
        },
      },
      {
        // 兜底安全选项（任何话术等级都在，代价更高，保证"任何时刻有一条不流失的路"）
        text: '〔稳妥〕安排女助理来给对面刷个跑车，劝她先歇两天',
        outcome: {
          effects: { money: -1000 },
          text: '钱到位了，{girl}消了气，留了下来。小猴猫懊悔道：这几百块换成小心心够在单单那耍一年了。',
        },
      },
      {
        // 踩雷 → 流失
        text: '〔图省事〕让她别理，关播睡一觉就好',
        outcome: {
          churnGirlId: CHURN_TARGET,
          effects: { fans: -300 },
          text: '你没当回事，{girl}觉得你不在乎她，第二天就退了号，再也没回来。',
        },
      },
    ],
  },
];

// ───────────────────────── whale · 单单鲸鱼弧光（girls/dandan.md 真迹定稿） ─────────────────────────

const WHALE: GameEvent[] = [
  {
    id: 'whale_dandan',
    kind: 'whale',
    trigger: { requireSignedGirl: 'girl_dandan', requireFlags: ['whaleEventReady'] },
    oneShot: true,
    image: 'dandan2.webp',
    text:
      '〔意外·单单 vs 黑牛〕就在刚刚，单单跟一个叫黑牛的土鸡蛋打PK，被骂破防了：\n' +
      '黑牛："我播间老铁说你是小猴猫的女朋友，小猴猫品味没这么低……你只是个附属品，蹭点人家热度、靠蝴蝶蹭点流，靠你自己来直播根本做不到什么体量。我的票比你多你就别来言语我！"\n' +
      '单单回怼："说你咋了？说你就受着呗。哇塞你那边三四百人，好多哟，吓死我了。你个傻福。小猴猫直播间一两千人，他从来不说自己多少人，你三四百人就装上了。"\n' +
      '黑牛输了 PK，却狂妄地甩下一句"你玩不起，那我也玩不起，你个骚女，哈哈哈哈"，直接挂断、拒绝了任何连麦邀请。\n' +
      '单单憋着一肚子气："这个黑牛，妈的，他直接不让我连了……他就是个土鸡蛋，他就是个土鸡蛋！（善意引导弹幕：）他叫“黑牛”，黑色的黑，牛马的牛。"',
    choices: [
      {
        text: '〔表白挽回〕找单单连麦表白安慰她',
        outcome: {
          img: 'dandan3.webp',
          whaleRetainRoll: {
            keepChance: 0.05,
            keepText:
              '小猴猫："怎么啦单单，我刚好有话和你说呢。（咳咳）女同学你好，我好早之前就注意到你了，我坐教室最后一排每天偷偷看你，看得我乌龟都翘了……我好像有点喜欢上你了，你接受我的表白吗？我可以当你的乌龟，在你身边守护你。"单单："看你表现吧。"\n——奇迹发生了，单单收到了小猴猫的表白安慰，留在了小猴猫身边……（奇迹发生了，可你知道这有多侥幸。）',
            churnText:
              '小猴猫："怎么啦单单，我刚好有话和你说呢。（咳咳）女同学你好，我好早之前就注意到你了，我坐教室最后一排每天偷偷看你，看得我乌龟都翘了……我好像有点喜欢上你了，你接受我的表白吗？我可以大大方方在你面前敲乌龟，做你的小乌龟……用我的龟壳包裹你吗？"单单一脸错愕："呃。弹幕都说你下头，怎么回事？"\n——表白没留住她。被黑牛那样羞辱过，听到小猴猫的乌龟翘感觉更下头了，单单几天后悄悄下了号，再也没上来……（单单离开了猴猫传媒）',
          },
        },
      },
    ],
  },
];

// ───────────────────────── hidden · 提前达标隐藏内容（§7.5） ─────────────────────────

// 隐藏第 11（Mulasakee）不再用"提前解锁事件"——改由 progression.sakeeShowsUp 驱动：
// 平时连不上他，只有赛季最后一天满足条件（粉丝十万 + 收服满10 + 阵容完整）他才主动空降。
// 见 girls/mulasakee.md 定稿 / systems/progression.ts。

export const ALL_EVENTS: GameEvent[] = [...WHALE, ...CHURN, ...FLAVOR];

export const EVENTS_BY_ID: Record<string, GameEvent> = Object.fromEntries(
  ALL_EVENTS.map((e) => [e.id, e]),
);
