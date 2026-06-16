/**
 * 猴女郎静态设定（design §4.2 / PRD 3.4）。
 * M0：思小捌 + 老火姬为真实定稿样本，其余为占位 def（凑门控，素材到了替换）。
 * 文案紧贴 girls/*.md 真迹；图先占位（assets.scenes 空 → UI 用色块占位）。
 */
import { balance } from '@/config/balance.config';
import type { MonkeyGirlDef } from '@/types';

// ── 思小捌对话库（introDialogue 与 moveReactions 共享）
const sixiaobaLines = {
  intro_narration: {
    who: 'narration' as const,
    text: '随机匹配，进了 B 站常青树思小捌的直播间，音乐开得好大声。',
  },
  intro_girl_hello: { who: 'girl' as const, text: '小猴猫你好～' },
  intro_monkey_hello: { who: 'monkey' as const, text: 'hello。' },
  rhetoric_beat0_girl: {
    who: 'girl' as const,
    text: '对面是大主播，对面是特殊人群。（念弹幕）什么特殊人群？人家长得挺帅。',
  },
  looks_beat0_girl: {
    who: 'girl' as const,
    text: '你把脸侧过去 45 度，手放下颚角这儿，保持这姿势看我就行……对，就露露这个角度，帅的～',
  },
  looks_beat1_monkey: {
    who: 'monkey' as const,
    text: '怎么样，是不是有点痞帅？喜欢这种感觉吗，妹妹？',
  },
  looks_beat1_girl: { who: 'girl' as const, text: '真的假的？' },
  looks_beat1_narration: {
    who: 'narration' as const,
    text: '颜值反问命中——她诱导你说的那句，你接住了。',
  },
  rhetoric_beat1_girl: {
    who: 'girl' as const,
    text: '你第一次随机就匹配到 B 站常青树了，给我点个关注吗？然后我给你们跳个火车摇可以吗？这个是抖音跳不了的哟，B 站可以随便火车摇。',
  },
  rhetoric_beat1_monkey: { who: 'monkey' as const, text: '可以给我们来点 B 站特供。' },
  money_beat0_girl: {
    who: 'girl' as const,
    text: '刷礼物才有付费视角哦～大哥们要看，就把人气票打上来。',
  },
  money_beat0_monkey: {
    who: 'monkey' as const,
    text: '兄弟们你们懂我意思吧？懂我意思吧？图鉴大大方方甩起来！',
  },
  cashDance_beat0_narration: {
    who: 'narration' as const,
    text: '思小捌把音乐一换，付费机位齐刷刷亮起来。她贴着镜头，跟着鼓点把腰胯一下下摇开——俯视位、贴脸位、低机位轮着切，每切一个角度弹幕就炸一波。火车摇，名不虚传。',
  },
  cashDance_beat0_monkey: {
    who: 'monkey' as const,
    text: '（彻底绷不住）哎我去……你这个、你这个……兄弟们这合理吗？这合理吗？我不敢看了，我真不敢看了——但我还得看。',
  },
};

// ── 老火姬 共享文本（introHook 与 winDialogue 开场旁白完全一致）
const LAOHUOJI_HOOK =
  '连麦区的御姐老火姬，一上来就调戏小猴猫——这种你来我往的整活，正是小猴猫主场。';

// ── 单单 共享台词（introDialogue / winDialogue / moveReactions 三处互引）
const dandanLines = {
  askHometown: { who: 'monkey' as const, text: '（岔开）你是哪里人？' },
  liaoning: { who: 'girl' as const, text: '我是东北辽宁的。' },
  cousins: { who: 'girl' as const, text: '挺可爱的，你挺像我姑家的弟弟。' },
  freestyleReview: {
    who: 'girl' as const,
    text: '挺好的，可能伴奏声音有一点点大，能听到更多你自己的会更好听。',
  },
};

// ── 豆包妹 共享台词（introDialogue 与 winDialogue 各出现一次）
const doubaoLines = {
  tuJian: { who: 'girl' as const, text: '哎哟，谢谢哥送来的图鉴！图鉴是什么呀？' },
  okNoProblem: { who: 'girl' as const, text: '行行行，OK没毛病。' },
};

// ── 甜菜鱼 共享台词（introDialogue 与 winDialogue 开场铁三角完全相同）
const tiancaiyuLines = {
  notTall: { who: 'girl' as const, text: '我看你真没冰箱高。' },
  fridgeTooTall: { who: 'monkey' as const, text: '冰箱太高了，不是我身高低，是冰箱高。' },
  likeBamboo: { who: 'girl' as const, text: '（念弹幕）他没牛和马高，像竹竿。' },
};

// ── uu 共享台词（introDialogue[0] 与 winDialogue[0] 完全一致）
const uuLines = {
  intro: {
    who: 'narration' as const,
    text: '又连到 uu——在校学生，业余开播。说来好笑，这妹妹以前还举报过小猴猫，嫌他低俗。这回再连上，画风可不太一样了。',
  },
};

// ── 哈尼mm 共享台词（introDialogue 全部 3 行与 winDialogue 前 3 行完全一致）
const hanimmLines = {
  introNarration: {
    who: 'narration' as const,
    text: '连到哈尼mm——广东潮汕的大主播，60 多万粉，气场稳得很。这是个尖货。得从多个角度攻略她才行。',
  },
  youreBeautiful: { who: 'monkey' as const, text: '你很美，你声音很甜，能夸我点啥吗？' },
  likeWangKaikai: { who: 'girl' as const, text: '你有点像……王凯凯。哇塞，你是本人吗？' },
};

export const MONKEY_GIRLS: MonkeyGirlDef[] = [
  // ── #1 思小捌（颜值/颜控 · tier1，girls/sixiaoba.md 定稿）
  {
    id: 'girl_sixiaoba',
    name: '思小捌',
    type: '混合',
    tier: 1,
    resist: { 颜值: 1.0, 话术: 1.0, 才艺: 1.0, 金钱: 0.8 }, // 金钱弱效防前期速通（作者定 2026-06-15）
    playsEnemySong: false,
    inChurnPool: false,
    captureScript:
      '〔颜值反问〕怎么样，是不是有点痞帅？喜欢这种感觉吗，妹妹？……你现在已经是我们猴猫传媒旗下 top one 的猴女郎了，有没有感觉？',
    introDialogue: [
      sixiaobaLines.intro_narration,
      sixiaobaLines.intro_girl_hello,
      sixiaobaLines.intro_monkey_hello,
      sixiaobaLines.rhetoric_beat0_girl,
      sixiaobaLines.looks_beat0_girl,
    ],
    moveReactions: {
      rhetoric: [[sixiaobaLines.rhetoric_beat1_girl, sixiaobaLines.rhetoric_beat1_monkey]],
      looks: [
        [sixiaobaLines.looks_beat0_girl],
        [
          sixiaobaLines.looks_beat1_monkey,
          sixiaobaLines.looks_beat1_girl,
          sixiaobaLines.looks_beat1_narration,
        ],
      ],
      money: [
        [
          sixiaobaLines.money_beat0_girl,
          sixiaobaLines.money_beat0_monkey,
          sixiaobaLines.cashDance_beat0_narration,
          sixiaobaLines.cashDance_beat0_monkey,
        ],
      ],
    },
    loseDialogue: [
      {
        who: 'narration',
        text: '思小捌完全不理你了，弹幕也安静了——就剩下你一个人在那儿尬聊。',
      },
      { who: 'monkey', text: '（卡壳）这个……这个……' },
      { who: 'girl', text: '（望向弹幕，轻轻摇头）大哥们，他不行。' },
      { who: 'monkey', text: '不是不是，我是隔壁刚过来的，有点……太紧张了。' },
      { who: 'girl', text: '哇，你们说的真的假的，什么情况？（已经开始招呼别的弹幕了）' },
      { who: 'girl', text: '哟，我这边有个大哥刚进来，先招待一下哦～有缘再聊！' },
      {
        who: 'monkey',
        text: '（无奈的对弹幕说）：没办法兄弟们，对面火箭队名宿，撤了，撤了吧。 ',
      },
    ],
    winDialogue: [
      sixiaobaLines.cashDance_beat0_narration,
      sixiaobaLines.cashDance_beat0_monkey,

      {
        who: 'narration',
        text: '一通火车摇摇得满屏礼物——最劲爆的那几下，镜头还是"恰好"卡在了边线上（剩下的，是另外的价钱）。',
      },
      {
        who: 'monkey',
        text: '你是我直播生涯以来见过最优秀的、最优雅的、最尖的女主播。有一说一。',
      },
      { who: 'girl', text: '真的假的？' },
      {
        who: 'monkey',
        text: '有一说一。我们有个猴猫传媒，我们叫猴猫家族，猴猫家族底下有猴猫传媒。你现在已经成为我们猴猫传媒旗下 top one 的猴女郎了，有没有感觉？你要不要加入我们猴猫传媒啊？',
      },
      { who: 'girl', text: 'OK~' },
      { who: 'monkey', text: '（对弹幕说）我滴乖，这个我太喜欢了，B站是所有直播平台的第一！' },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'sixiaoba.webp' },
        { key: 'reacting', src: 'sixiaoba2.webp' },
        { key: 'won', src: 'sixiaoba3.webp' },
      ],
    },
  },

  // ── #4 老火姬（话术·御姐dom · tier2，girls/laohuoji.md 定稿）
  {
    id: 'girl_laohuoji',
    name: '老火姬',
    type: '混合',
    tier: 2,
    resist: { 话术: 1.0, 颜值: 1.0, 才艺: 0.4, 金钱: 0.4 }, // 混合·难搞：仅话术+颜值有效（作者定 2026-06-15）
    counterPower: 10, // tier2 默认 8 之上，更难
    playsEnemySong: false,
    inChurnPool: true,
    introHook: LAOHUOJI_HOOK,
    introDialogue: [
      {
        who: 'narration',
        text: '连麦区的御姐老火姬，性感火辣，喜欢控制。',
      },
      { who: 'girl', text: '哈喽，小猴猫' },
      { who: 'monkey', text: 'hello老火姬，你是哪里人？' },
      { who: 'girl', text: '我是贵州人，你长得好可爱♥' },
    ],
    captureScript:
      '〔邀约·canon〕老火姬，有一说一。我们有个猴猫家族，底下有猴猫传媒，你这话术、这范儿，进来就是 top one 猴女郎，有没有感觉？',
    winDialogue: [
      { who: 'narration', text: LAOHUOJI_HOOK },
      {
        who: 'monkey',
        text: '他们说你长得有点像 Billionhappy，你知道吗？兄弟们，去对面把名字打出来给她看，真有点像。',
      },
      { who: 'girl', text: '男的？' },
      { who: 'monkey', text: '对，但是他长得有点雌。' },
      { who: 'girl', text: '噢~ 原来我不是妈咪，我是 daddy~' },
      { who: 'monkey', text: '高雅，实在是高雅。' },
      { who: 'narration', text: '一来一回谁也没占着便宜，她反倒越聊越上头——她吃这套。话术命中。' },
      {
        who: 'monkey',
        text: '老火姬，有一说一。我们有个猴猫家族，底下有猴猫传媒，你这话术、这范儿，进来就是 top one 猴女郎，有感觉吗？',
      },
      { who: 'girl', text: '哦，那要看你表现噢~ 小猴猫' },
    ],
    loseDialogue: [
      { who: 'narration', text: '话术没接住，反被她一路压着打。' },
      { who: 'girl', text: '你没有注意我已经压过你了吗？我已经赢了。笨蛋。' },
      { who: 'monkey', text: '这……我们又没打 PK……（心虚）' },
      { who: 'monkey', text: '（脸红）那你……那你惩罚我一下，你再扇我两巴掌吧。' },
      { who: 'girl', text: '那我不会那么温柔了。等我选一个音乐。' },
      {
        who: 'monkey',
        text: '（念弹幕）太是奖励了，兄弟们，这是惩罚，她惩罚我，我太不想做这个了。',
      },
      { who: 'girl', text: '小猴猫！' },
      { who: 'monkey', text: '到！（捂脸作痛）我错了我错了，master，我错了。' },
      { who: 'girl', text: '难道不应该说谢谢吗？' },
      { who: 'monkey', text: '谢谢谢谢 master，谢谢 master 奖励我。' },
      { who: 'girl', text: '（小猴猫画面卡住）行了，他卡了。他拒绝我的邀请了。' },
      { who: 'monkey', text: '我用电脑直播，有时候就接不到，不知道为啥。OK 行，下次再聊，拜拜。' },
      { who: 'narration', text: '（自言自语）快跑，快跑，快跑，哈哈。' },
    ],
    moveReactions: {
      rhetoric: [
        [
          { who: 'girl', text: '你现在好一点吗？他们经常跟我说你哭了。' },
          {
            who: 'monkey',
            text: '那是公式化弹幕——他们在我这儿刷"谁谁哭了"，到你那儿又刷"小猴猫哭了"，公式弹幕。',
          },
          { who: 'girl', text: '这样啊。因为他们问我的时候，我就一直问他们——小猴猫是哪里哭了？' },
          { who: 'monkey', text: '我滴乖（猴头翘了）。' },
          { who: 'girl', text: '你是哪里哭了？' },
          { who: 'monkey', text: '肯定肯定是那个啥，肯定是上面哭了。' },
          { who: 'girl', text: '那我懂了懂了，你哭了，然后你腿痒了，是不是？' },
          { who: 'monkey', text: '不是我不敢，不敢在外面瞎哭，除了跟你连的，哪敢瞎哭，是吧？' },
        ],
        [
          { who: 'monkey', text: '我今天有点难过，你能安慰我一下吗？' },
          { who: 'girl', text: '安慰你，懂了，是这样吗？（轻轻扇了小猴猫一巴掌）' },
          {
            who: 'monkey',
            text: '（故作委屈）为什么打我？我做错什么了，为什么要打我？……我还要。我还要。（吐舌头）',
          },
          { who: 'girl', text: '还要叫我什么？' },
          { who: 'monkey', text: 'master。（啪）Master, again。（啪）Master, again。' },
        ],
        [
          { who: 'monkey', text: '妈妈妈妈' },
          { who: 'girl', text: '懂了，（轻轻一巴掌）宝宝，让我好好安慰你。' },
          { who: 'monkey', text: '（故作委屈）哎，为什么打我？我做错什么了……（小声）我还要。' },
          { who: 'girl', text: '哟，那你要叫我什么？' },
        ],
      ],

      singHero: [
        [
          { who: 'monkey', text: '我给你表演一首《人上人》好不好？刚学会第一次给别人唱。' },
          { who: 'girl', text: '（意味深长的笑了~）哦，小猴猫，那我有你的第一次了。' },
          { who: 'monkey', text: '唱完了，你喜欢这首艾志恒的歌吗？' },
          {
            who: 'girl',
            text: '我更喜欢的是你~ 喜欢你的可爱😊 小猴猫你好可爱，摸摸你的头╰(￣ω￣ｏ)',
          },
        ],
      ],
      looks: [[{ who: 'monkey', text: '喜欢吗，好姐姐，是不是有点痞帅？' }]],
    },
    assets: {
      scenes: [
        { key: 'idle', src: 'laohuoji1.webp' },
        { key: 'reacting', src: 'laohuoji2.webp' },
        { key: 'won', src: 'laohuoji3.webp' },
      ],
    },
  },

  // ── #6 单单（鲸鱼·混合 颜值+才艺·tier2；girls/dandan.md 全弧光定稿 2026-06-14：
  //     征服 winDialogue + 黑牛/表白事件配图 dandan2/3 已接入）
  {
    id: 'girl_dandan',
    name: '单单',
    type: '混合',
    tier: 2,
    resist: { 颜值: 1.0, 才艺: 1.0 },
    isWhale: true,
    inChurnPool: false, // 不进常规流失池，走专属意外事件
    playsEnemySong: false,
    introHook: '随机匹配到单单——一名耐看型的颜值区女主播。',
    introDialogue: [
      {
        who: 'narration',
        text: '随机匹配到单单——一名耐看型的颜值区女主播。',
      },
      { who: 'monkey', text: '你好，单单。能不走吗？我们能聊会儿天吗？' },
      {
        who: 'girl',
        text: '你好。可以，怎么玩呢？你是在美国吗？你直播间好多人，为什么我直播间进这么多人？',
      },
      {
        who: 'monkey',
        text: '是的，我在美国，你也在美国吗？我是芝加哥街上的大明星，很多人看我直播的。',
      },
      {
        who: 'girl',
        text: '我在中国',
      },
      dandanLines.askHometown,
      dandanLines.liaoning,
      {
        who: 'monkey',
        text: '你在东北辽宁吗？我最喜欢东北人了，身边朋友都是东北的。但你咋没东北口音呢？',
      },
      {
        who: 'girl',
        text: '因为我就骂人的时候会说，平时不太说。',
      },
    ],
    captureScript:
      '〔颜值反问 + 才艺两手〕……兄弟们这个真不一样……（下播后自语）我靠，她不会真有点爱上我了？',
    winDialogue: [
      {
        who: 'monkey',
        text: '听说昨天有人欺负你了？我昨天才跟他连过，泡面头、黑框眼镜，背后一个绿幕。你认识吗？',
      },
      { who: 'girl', text: '他骂我。' },
      {
        who: 'monkey',
        text: '他骂你？我立刻帮你讨伐他！我把语音键点开，你想说什么直接说，我给他弹过去。我说 321 你就开始。321 开始。',
      },
      { who: 'girl', text: '你个绿布怪，还天天这这这那那那的。你个绿布怪。' },
      {
        who: 'monkey',
        text: '（重放）没毛病，讨伐他了，是不是感觉心情舒畅了很多？他对这么可爱的女孩子发脾气，太不绅士了。',
      },
      { who: 'girl', text: '（咯咯笑）是的。' },

      {
        who: 'monkey',
        text: '兄弟们帮我澄清——我平常跟她们连，上去先一句"你愿不愿意加入猴猫传媒"。但我刚连上你那一刻，心态就完全不一样了。对你完全不一样。',
      },
      {
        who: 'monkey',
        text: '那以后你直播就一个节目：跟我 PK。来，我们互关一下，以后你上号第一件事，先看小猴猫在不在播。',
      },
      { who: 'girl', text: '感觉你是大主播欸。跟你连麦会不会耽误你？' },
      {
        who: 'monkey',
        text: '不会。有一说一，我巴不得开 24 小时直播就为了跟你连线，都不舍得下播了。我跟别的女主播聊五分钟就聊不下去，跟你能聊这么久。',
      },
      {
        who: 'narration',
        text: '单单脸红了，心跳加速了，感觉自己好像有点喜欢上小猴猫了。她也不想下播了，想一直跟小猴猫聊下去……',
      },
      {
        who: 'monkey',
        text: '不错，真可爱。那咱今天就这样，不能聊太久，聊太久没有新鲜感。',
      },
      { who: 'girl', text: '好吧，祝你天天开心。下次见。' },
      {
        who: 'narration',
        text: '两人互关了。单单成了猴猫传媒旗下的猴女郎——从今天起，她上号第一件事就是看小猴猫在不在播。',
      },
      {
        who: 'monkey',
        text: '（下播后，自言自语）兄弟们，这个真不一样……我靠，她不会真有点爱上我了？',
      },
    ],
    loseDialogue: [
      {
        who: 'narration',
        text: '话说得太顺了，她反而听出味儿来了——这套话术，不只是给她一人的。',
      },
      { who: 'monkey', text: '你还没加入猴猫传媒吧？有一说一，我们猴猫家族……' },
      { who: 'girl', text: '（轻轻打断）你不是说，对我完全不一样吗？' },
      { who: 'monkey', text: '对，就是不一样，你是 top……' },
      { who: 'girl', text: '……感觉弹幕跟着你一起把词打出来了。' },
      {
        who: 'narration',
        text: '她没在撒气，就是说了个事实。那副呆萌样没变，但眼神收回来了。',
      },
      { who: 'girl', text: '你们这边人刷屏的人太多了。祝你天天开心，拜拜。' },
      {
        who: 'narration',
        text: '屏幕黑了。她没拉黑，只是没互关——这种感觉，比拉黑还难受一点。',
      },
      {
        who: 'monkey',
        text: '（气急败坏）你们不要刷辣个，不要刷辣个，这个很安逸的，兄弟们。',
      },
    ],
    // 逐招对白（girls/dandan.md 真迹）：话术多 beat 递进；颜值反问=姑家弟弟；
    // 才艺两手分给唱《英雄》与 Monkey Freestyle；金钱非她口味，走中性兜底。
    moveReactions: {
      rhetoric: [
        [
          { who: 'monkey', text: '你这么可爱的女孩子，骂起人来应该很反差。能羞辱我两句吗？' },
          {
            who: 'girl',
            text: '你怎么用座机诺基亚直播啊？',
          },
          {
            who: 'monkey',
            text: '我滴乖，这么可爱！这不算羞辱，好妹妹',
          },
        ],
        [
          { who: 'monkey', text: '你这么可爱的女孩子，骂起人来应该很反差。能羞辱我两句吗？' },
          {
            who: 'girl',
            text: '（认真语气）你刘海都挡眼睛了，不知道剪一下吗？',
          },
          {
            who: 'monkey',
            text: '我滴乖，这么可爱！这不算羞辱，好妹妹',
          },
        ],
        [
          { who: 'monkey', text: '我感觉你应该才上高中。' },
          { who: 'girl', text: '我挺大年纪了。毕业了。' },
          { who: 'monkey', text: '那应该是 00 年的。98 年的？95 年的？' },
          { who: 'girl', text: '猜这么老？给我往 95 猜了，那我得多大了。' },
          { who: 'monkey', text: '03 年的？02 年的？01 年的？' },
          { who: 'girl', text: '01 年。' },
          { who: 'monkey', text: '我也是 01 年的。' },
        ],
        [
          { who: 'monkey', text: '我也是八月生日，我跟你差四天，我 8 月 23 的。' },
          { who: 'girl', text: '那你也是处女座。（念弹幕）他们说你 91 年的。' },
          { who: 'monkey', text: '我去我太 91 年了。我全网可查，实名制上网的。' },
        ],
      ],
      looks: [
        [
          { who: 'girl', text: '我发现你有个特点，你笑的时候想用那个娃娃挡住嘴，这样。' },
          {
            who: 'monkey',
            text: '就显得优雅一点，像个绅士。你觉得我可爱吗？是不是有点痞帅？',
          },
          dandanLines.cousins,
        ],
      ],
      singHero: [
        [
          {
            who: 'monkey',
            text: '我唱一首 Monkey Focused Freestyle，专门为你而唱的，原创曲目，好听不？',
          },
          dandanLines.freestyleReview,
          { who: 'girl', text: '我觉得只要勇敢唱都不会难听的。大大方方唱就是好听。' },
          { who: 'narration', text: '〔才艺·另一手命中〕——她还把"大大方方"原样还了回来。' },
          { who: 'monkey', text: '"大大方方"是我们的原创梗，我创的！来跟我念：爆了爆了。' },
          { who: 'girl', text: '爆了爆了。' },
          { who: 'monkey', text: '闹得麻麻的。真是要把我肚肚都笑炸啊。' },
          { who: 'girl', text: '闹得麻麻的。这要把我的肚肚给笑炸了。' },
        ],
      ],
    },
    assets: {
      scenes: [
        { key: 'idle', src: 'dandan.webp', objectPosition: 'center 30%' },
        { key: 'reacting', src: 'dandan3.webp', objectPosition: 'center 30%' },
        { key: 'won', src: 'dandan2.webp', objectPosition: 'center 30%' },
      ],
    },
  },

  // ── #2 豆包妹（金钱型 tier1，girls/doubao.md 作者审核通过 2026-06-13）
  // 大方/玩得起/平翘舌/怕封禁；收服=刷礼物哄上推荐 → 她大方配合节目效果
  // （撩睡裤双汇火腿肠/踩摄像头/脚腋下肚脐眼隐晦带过）。
  {
    id: 'girl_doubao',
    name: '豆包妹',
    type: '金钱',
    tier: 1,
    resist: { 金钱: 1.0 }, // 金钱有效但不双倍；其余走 coefOffType 默认
    playsEnemySong: false,
    inChurnPool: true,
    introHook: '随机连到豆包妹——大方、玩得起的女主播，她会成为小猴猫的 day1 吗？',
    introDialogue: [
      {
        who: 'narration',
        text: '随机连到豆包妹——一位大大方方的女主播，她会成为小猴猫的day1吗？',
      },
      doubaoLines.tuJian,
      {
        who: 'monkey',
        text: '这个图鉴是礼物来的，是官方搞的活动。哥别的没有，图鉴给你管够，兄弟们，图鉴大大方方的丢给对面！',
      },
      doubaoLines.okNoProblem,
    ],
    captureScript:
      '〔金钱·哄上推荐〕够用够用够用了，玩得起。妹妹你大方、懂规矩——来我猴猫家族，底下有猴猫传媒，有没有感觉？',
    winDialogue: [
      { who: 'narration', text: '嘴皮子哄不动她，得来点实在的——小猴猫把礼物刷了上去。' },
      doubaoLines.tuJian,
      {
        who: 'monkey',
        text: '这个图鉴是礼物来的，是 DY 官方搞的活动。虽然一个也没多少钱，但它是不算到音浪里面的，跟星守护一样。哥别的没有，图鉴给你管够。',
      },
      doubaoLines.okNoProblem,
      {
        who: 'monkey',
        text: '妹妹你都上推荐了，刷到这份儿上，是不是得给来点节目效果？我要先看腿，行不？',
      },
      { who: 'girl', text: '我穿的是睡裤，我把它撩起来呗。' },
      { who: 'monkey', text: '撩起。把双汇火腿肠直接展示起就完事了，那边另外一边。' },
      { who: 'narration', text: '豆包妹大大方方撩了睡裤。' },
      {
        who: 'monkey',
        text: '（瞄了一眼）够用够用够用够用了，够用了，可以，不赖，可以可以，玩得起，玩得起。那你对着摄像头踩两下，可以不？就踩两下。',
      },
      { who: 'girl', text: '看清就行了，十秒钟真会被抬的，这抬了可不是你一天两天的事。' },
      { who: 'monkey', text: '穿个袜子跟戴个手套有啥区别，咋会被抬呢？' },
      {
        who: 'girl',
        text: '穿袜子也会露，露袜子都能被抬，我真不骗你。友友们捂个眼啊，平台规矩我懂，就一下下，可别给我抬咯。',
      },
      {
        who: 'narration',
        text: '豆包妹到底还是玩得起——袜子一脱，对着镜头踩了两下；脚、腋下、肚脐眼都大大方方亮了个相。镜头很有分寸地一带而过（剩下的，是另外的价钱）。',
      },
      {
        who: 'monkey',
        text: '够用够用够用，够用了，玩得起。妹妹我说句正经的：你这人大方、懂规矩、还玩得起，比我平时遇到那些张嘴就要我爆米的强一百倍。',
      },
      {
        who: 'monkey',
        text: '有一说一，你今天能连到我算你有眼光。我星海湾路主理人你知道吧？小鬼是我 day1——那阵子他节奏闹得大，我一条视频一己之力把他风评给拉回来的，他可感谢我了。这种牌面的猴女郎名额，我平常不轻易给人。',
      },
      {
        who: 'monkey',
        text: '来我猴猫家族，底下有猴猫传媒。我是开传媒公司的猴博士，定期在直播请猴女郎表演节目，有没有感觉？',
      },
      { who: 'girl', text: '我去，哥你这么有实力？好，行行，OK！' },
    ],
    loseDialogue: [
      {
        who: 'narration',
        text: '小猴猫想空手套白狼，嘴皮子都冒出火星了，礼物刷得抠抠搜搜——对面老头一顿偷塔，PK 输了。',
      },
      {
        who: 'girl',
        text: '友友们这把能不能帮我赢一下？来宝宝们有没有给我偷个塔的？友友们能不能给我偷个塔？',
      },
      { who: 'girl', text: '来吧，露露你的足吧，十秒宗。' },
      { who: 'monkey', text: '哪有 10 秒钟，我就踩两脚。可以了不？我玩的起，可以不？' },
      { who: 'girl', text: '哎呀，你脚上有个痣。' },
      { who: 'monkey', text: '不是有个痣。' },
      { who: 'girl', text: '应该四你脚底下真有个痣。' },
      { who: 'monkey', text: '没有，你看错了。' },
      { who: 'girl', text: '你看真有个痣！' },
      {
        who: 'monkey',
        text: '有就有吧，有就有，行，各位，那咱今天就这样吧，我准备下播了，我真累了。行行行，改天有机会再聊。今天没看到你的脚，太遗憾了，下次再看。',
      },
      { who: 'girl', text: '下次有机会。拜拜。' },
      { who: 'narration', text: '下播后，空屏幕前——' },
      {
        who: 'monkey',
        text: '对面那个人真的是不聪明，那个大哥真是脑子有问题。他看我的脚有什么意思，还帮豆包妹刷。太不懂点了，对面这个人太不懂点了。行，兄弟们今天就下了，今天下了。',
      },
    ],
    assets: { scenes: [{ key: 'idle', src: 'doubao.webp' }] },
  },
  // ── #3 幼师（才艺/感化 tier1，girls/youshi.md 作者审核通过 2026-06-13）
  // 傻白甜·好骗·土鸡蛋口味（牛和马/三条a/法年轻）；直播间放牛和马的歌；
  // 收服=唱《英雄》感化；失败=《英雄》没唱进去 → 土鸡蛋反杀/被闭麦。
  {
    id: 'girl_youshi',
    name: '幼师',
    type: '混合',
    tier: 1,
    resist: { 颜值: 1.0, 话术: 1.0, 才艺: 1.0, 金钱: 0.8 }, // 金钱弱效防前期速通（作者定 2026-06-15）
    requiredMove: 'singHero', // 不唱《英雄》无论如何收不掉（作者定 2026-06-15）
    inChurnPool: true,
    introHook:
      '随机匹配到"幼师"——看似傻白甜的女主播有一副浑然天成的辣条音。直播间正在放着牛和马的歌。小猴猫能感化她吗？',
    introDialogue: [
      {
        who: 'narration',
        text: '随机匹配到"幼师"——看似傻白甜的女主播有一副浑然天成的辣条音。直播间正在放着牛和马的歌。小猴猫能感化她吗？',
      },
      { who: 'girl', text: '你好，小猴猫。' },
      {
        who: 'monkey',
        text: 'hello，你声音好有质感。你是湖北人？艾志恒（ASEN）是你老乡，他是你们咸丰的骄傲，你知道吗？',
      },
      { who: 'girl', text: '谁跟你说我是咸丰？我在武汉。' },
      {
        who: 'monkey',
        text: '那也是湖北，差球不多，差球不多。ASEN 现在出人头地，你们整个湖北都沾光。你以后出去先说"我是艾志恒老乡"，可以不？',
      },
      { who: 'girl', text: '嗯……那确实。但我要是艾志恒老乡，我听牛和马怎么办？' },
      { who: 'monkey', text: '那你不纯粹僵尸一个吗？' },
    ],
    captureScript:
      '〔才艺·《英雄》感化〕幼师跟着节奏摇晃起来——这次，是感化。咱俩点个互关，你就大大方方加入我们猴猫传媒，跟着小猴猫混。',
    moveReactions: {
      singHero: [
        [
          {
            who: 'monkey',
            text: '（被土鸡蛋音乐折磨中）这样,我也来一首，我们battle一下，我们比一下看看谁唱的更好。我给你甩一甩我的招牌曲目，《英雄》。这首我太拿手了，怕唱出来直接给你唱得深陷不已、无法自拔。',
          },
          { who: 'monkey', text: '（默默祈祷中）来,艾德宝，帮我拿下这场battle...' },
        ],
      ],
      rhetoric: [
        [
          {
            who: 'monkey',
            text: '我跟你说个真事——xxxtentacion他没嘎，隐居起来了，就在我这芝加哥，我在街上遇到过他真人，懂吗？这是真事。',
          },
          { who: 'girl', text: '啊？他还活着啊？厉害猴猫，你这人脉认知各方面真不一般。' },
        ],
        [
          {
            who: 'monkey',
            text: '我还有个王炸，已经上升到娱乐圈层面了——O坤给我录过祝福视频，想看吗？这个我平常都不给他们看的。',
          },
          { who: 'narration', text: '小猴猫掏出手机，播了一段不知哪儿来的"祝福视频"。' },
          { who: 'narration', text: '视频音：小猴猫，我祝你星途璀璨。O坤。' },
          { who: 'monkey', text: '正儿八经大明星来的，有一说一。' },
          { who: 'girl', text: '还是你有牌面。' },
        ],
        [
          { who: 'monkey', text: '你今天连到我，真是积德了。来，给我们来首说唱不过分吧。' },
          {
            who: 'narration',
            text: '幼师张口就是三条a、牛和马、法年轻大串烧——闹得麻麻的。',
          },
        ],
      ],
    },
    winDialogue: [
      { who: 'monkey', text: '（默默祈祷）来艾德宝，帮我拿下这场 battle……' },
      {
        who: 'narration',
        text: '幼师跟着节奏摇晃起来——是被《英雄》感化了，还是把小猴猫闭麦了？这次，是感化。',
      },
      {
        who: 'monkey',
        text: '那我们点个互关，你就大大方方加入我们猴猫传媒，跟着小猴猫混，可以不？',
      },
      { who: 'girl', text: '可以可以。' },
      { who: 'monkey', text: '以后你出去就说自己是猴女郎，懂不？' },
      { who: 'girl', text: '没得问题。' },
      { who: 'monkey', text: '行，今天就到这了，拜拜。兄弟们，唱的我累死了。' },
    ],
    loseDialogue: [
      {
        who: 'girl',
        text: '（不为所动）行了行了。我跟你说，我去海口看过 Travis 演唱会，现场蛮开心的。我最喜欢坑爹老妹儿的 N95，三条a 我也想看现场，牛和马、法年轻我都听。',
      },
      { who: 'monkey', text: '那你说说你三首最喜欢的 Travis 的歌？' },
      { who: 'girl', text: '呃……sicko mode，呃……说不出了，我跟风去的。' },
      { who: 'monkey', text: '你跟风看个演唱会还回头教育我？你那叫陪看。' },
      {
        who: 'girl',
        text: '陪看我也比你强。你这种洋鸡蛋，整天 ASEN 长 ASEN 短、这个老黑那个老黑的，我就爱听点牛和马怎么了？ ',
      },
      {
        who: 'narration',
        text: ' 弹幕一看到ASEN被攻击，直接去把对面直播间围绕住了，铁丝网和图鉴一起刷屏，幼师一句话没说就把pk挂断了 ',
      },
      {
        who: 'monkey',
        text: '（气急败坏）你们不要刷辣个，不要刷辣个，这个很安逸的，兄弟们。',
      },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'youshi.webp' },
        { key: 'reacting', src: 'youshi2.webp' },
        { key: 'won', src: 'youshi3.webp' },
      ],
    },
  },
  // ── #5 甜菜鱼（话术型 tier2，girls/tiancaiyu.md 作者审核通过 2026-06-13）
  // 毒舌机锋少女；dom 倾向俏皮（"叫爸爸/老公拜拜"）；
  // 收服=话术扛住连环嘴；失败=光擦边（关美颜/看脚/腋下/胸）→ 引超管。
  {
    id: 'girl_tiancaiyu',
    name: '甜菜鱼',
    type: '混合',
    tier: 2,
    resist: { 话术: 0.5, 颜值: 1.0, 才艺: 0.4, 金钱: 0.4 }, // 混合·难搞：话术被反克（嘴皮子比她快不了）、颜值有效；才艺/金钱弱效
    counterPower: 10, // tier2 默认 8 之上，更难
    playsEnemySong: false,
    inChurnPool: true,
    introHook: '随机匹配到甜菜鱼——小孩音太难绷。扛住她的连珠炮，话术才能命中。',
    introDialogue: [
      {
        who: 'narration',
        text: '随机匹配到甜菜鱼——一张嘴比谁都快，话术猛兽，句句反杀。这种连珠炮，得扛得住。',
      },
      tiancaiyuLines.notTall,
      tiancaiyuLines.fridgeTooTall,
      tiancaiyuLines.likeBamboo,
    ],
    captureScript:
      '〔话术命中〕咱俩点个互关，下次还能连到，你就相当于加入我们这个猴女郎旗下了……老公拜拜。',

    moveReactions: {
      rhetoric: [
        [
          { who: 'monkey', text: '好妹妹，正儿八经问你一句，你喜欢竹竿还是肌肉男？' },
          { who: 'girl', text: '我喜欢薄肌。' },
          { who: 'monkey', text: '薄肌？我也算薄肌，这衣服脱了我就是薄肌，但这会儿不方便。' },
          { who: 'girl', text: '你反过来应该是——你肌薄吗？' },
          { who: 'monkey', text: '你咋这么会聊。你真有语言天赋啊，好妹妹。' },
        ],
        [
          {
            who: 'monkey',
            text: '你知道我是啥吗？我是那种宅男，整天看漫画、玩嘎啦game，跟动画里的女生谈恋爱，没咋跟现实女生说过话，所以我就想正儿八经跟你聊。',
          },
          { who: 'girl', text: '你个臭二次元。' },
        ],
        [
          { who: 'girl', text: '想看啥就直说，老子给你当女菩萨就行。你叫爸爸。' },
          { who: 'monkey', text: '（故作恼羞）他说什么玩意儿，我叫爸爸，你咋能说这种话？' },
          { who: 'girl', text: '我就爱说怎样？' },
          { who: 'narration', text: '你来我往谁也不让谁——她嘴上嫌弃，其实越聊越来劲。话术命中。' },
        ],
      ],
    },
    winDialogue: [
      {
        who: 'monkey',
        text: '这等会儿妹妹，咱俩点个互关，下次还能连到，你就相当于加入我们这个猴女郎旗下了，可以不？',
      },
      { who: 'girl', text: '哟~ 很荣幸。' },
      { who: 'monkey', text: '好妹妹，咱俩今天就聊到这儿，下次再聊，拜拜拜拜。' },
      { who: 'girl', text: '下次再拜拜拜拜……老公拜拜。' },
      { who: 'monkey', text: '拜拜。哎呀，好妹妹！' },
      {
        who: 'narration',
        text: '（下播后，没绷住）这小妹妹太会来事儿了，这小孩音太难绷了……兄弟们别刷龟了，你没听她说"老公拜拜"吗？',
      },
    ],
    loseDialogue: [
      { who: 'narration', text: '话术没在点上，光顾着想看——' },
      { who: 'girl', text: '你品味太低了。' },
      {
        who: 'monkey',
        text: '你能把美颜关了我看看吗？你跟我连一会儿，那么多好兄弟给你刷礼物，大大方方关一下。',
      },
      { who: 'girl', text: '不行。' },
      { who: 'monkey', text: '那把你的脚展示一下。' },
      { who: 'girl', text: '谁追求谁？' },
      { who: 'monkey', text: '哎呀，我感觉你腋下应该挺安逸的。' },
      { who: 'girl', text: '你这人哪儿都想看，装的雷达啊？' },
      { who: 'monkey', text: '把头发拨开，挡视野了……想看你胸部。' },
      { who: 'girl', text: '没有！（故作生气）……我真服了，他都给我提示了。' },
      { who: 'narration', text: '超管屏蔽。十秒后恢复直播——可对面那条线，断了。' },
      {
        who: 'monkey',
        text: '（慌）不是，你们谁记得她 ID？这猴女郎直接没了！我刚才也没跟她互关，这以后咋连？没了我怎么连？',
      },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'tiancaiyu1.webp' },
        { key: 'reacting', src: 'tiancaiyu1.webp' },
        { key: 'won', src: 'tiancaiyu2.webp' },
      ],
    },
  },
  // ── #7 2绷（特殊·难搞型 tier3，girls/2beng.md 作者拍板 2026-06-13）
  // 难搞=对单一攻略几乎免疫（颜值/金钱被她挡回），必须话术撬嘴 + 才艺盘活的组合拳；
  // 高冷冷场耗人 → counterPower 偏高。
  {
    id: 'girl_2beng',
    name: '2绷',
    type: '混合',
    tier: 3,
    resist: { 话术: 1.0, 才艺: 1.0, 颜值: 0.4, 金钱: 0.4 },
    counterPower: 13, // 高冷"深度思考"冷场耗精力，tier3 默认 11 之上
    playsEnemySong: false,
    inChurnPool: true,
    introHook:
      '又连到湖南乡里别 2绷——22 岁、干过设计师助理。一台高冷的"读弹幕机器人"，每句话前都要"深度思考"半天，还总惦记你会不会掉她美颜。',
    introDialogue: [
      {
        who: 'narration',
        text: '前设计师助理2绷。一块难啃的硬骨头：话密、自问自答都顶不动，她每句话前都要"深度思考"半天。',
      },
      {
        who: 'girl',
        text: '（深度思考两秒）……你不会掉我美颜吧？我看着切片你连到一个就掉她一个美颜呢。',
      },
      { who: 'monkey', text: '我哪有那本事掉你美颜，你别害怕。咱好好唠会儿，行不？' },
      { who: 'girl', text: '（深度思考一秒）那你连我干啥？' },
    ],
    captureScript:
      '〔话术撬嘴 + 才艺盘活〕你看你不读弹幕、盯着我，不就利索了吗？反差挺可爱，有一说一。咱俩点个互关，你就算加入我们猴猫传媒旗下了。',
    moveReactions: {
      rhetoric: [
        [
          {
            who: 'monkey',
            text: '你还干设计师助理，你干的明白吗？你真的干的明白设计师助理吗？',
          },
          { who: 'girl', text: '（深度思考2秒后）所以我就没干了。' },
          {
            who: 'monkey',
            text: '那干不明白就不干了是吧？你还挺实诚（笑），跟这设计师助理要干什么，其实平常工作内容是什么？',
          },
          { who: 'girl', text: '（深度思考3秒后）画画，图画那种室内设计的图片。' },
          { who: 'monkey', text: '就画画，也不咋用跟人沟通是吧?' },
          { who: 'girl', text: '（沉默了一会）' },
        ],
        [
          { who: 'monkey', text: '你这个人挺有意思的，你说话之前都要深度思考一下，是不是？' },
          { who: 'monkey', text: '跟我聊聊天就放松了，不紧张,好吧。这样，我看一下你胳膊可以吗？' },
          { who: 'girl', text: '（深度思考4秒后）这样子？（举起胳膊）' },
          {
            who: 'monkey',
            text: '没有花刀？那胳肢窝呢？脚底板呢？他们喜欢在脚底板改花刀，我来看一下。',
          },
          { who: 'girl', text: '不行' },
        ],
        [
          {
            who: 'monkey',
            text: '你看你又冷场了。好妹妹，你不用想那么久，咱俩就唠嗑，唠错了也没事。',
          },
          { who: 'girl', text: '下一秒就掉我美颜了。' },
          { who: 'monkey', text: '我真没那本事掉你美颜，你别老惦记。你紧张啥？跟我唠就放松了。' },
          { who: 'girl', text: '（深度思考一秒）我容易紧张。' },
        ],
      ],

      singHero: [
        [
          {
            who: 'monkey',
            text: '那这样，我给你唱一首 Monkey Focused Freestyle，专门为你 2绷 写的，原创曲目，你听听。',
          },
          {
            who: 'narration',
            text: '小猴猫一通自顾自的 freestyle，把她那些"深度思考""读弹幕""乡里别"全编进了词里。2绷愣了两秒——这回没去看弹幕。',
          },
          { who: 'girl', text: '（难得没卡壳，咯咯笑）哈哈，你咋还把我编进去了。' },
          {
            who: 'monkey',
            text: '可以啊好妹妹！你正常说话了！你看你不读弹幕、盯着我，不就利索了吗？反差挺可爱。',
          },
        ],
      ],
    },
    winDialogue: [
      {
        who: 'narration',
        text: '一块难啃的硬骨头——话密、自问自答都顶不动，她每句话前都要"深度思考"半天。得先把这台读弹幕机器人撬开嘴，再唱热她。',
      },

      { who: 'girl', text: '（深度思考一秒）……那你以后还连我吗？' },
      {
        who: 'monkey',
        text: '连啊，咱俩点个互关，你就算加入我们猴猫传媒旗下了。等着我连你给你甩大礼物行不？',
      },
      { who: 'girl', text: '行。' },
      {
        who: 'narration',
        text: '互关了。2绷成了猴猫传媒旗下的猴女郎——一台被小猴猫硬生生盘活的"读弹幕机器人"。',
      },
    ],
    loseDialogue: [
      { who: 'narration', text: '2绷一句话没说，直接部署了机器人大军，机器人全来直播间围绕了！' },
      { who: 'narration', text: ' 满屏的机器人和铁丝网直接把小猴猫的拯救者干冒烟了 ' },
      { who: 'monkey', text: '兄弟们兄弟们，我弹幕卡了，我看不到你们发的弹幕了！' },
      { who: 'girl', text: '你也太低俗了，别给我封了你这个。我走了。' },
      { who: 'monkey', text: '别别别，2绷别走，开玩笑的——' },
    ],
    assets: { scenes: [{ key: 'idle', src: '2bong.webp' }] },
  },
  // ── #8 uu（金钱型 tier3，girls/uu.md 作者拍板 2026-06-13；无真迹·创作口吻已审）
  // 闷骚·黑转粉（举报过小猴猫→真香）；收服=金钱（呼应室友梗：刷礼物/带货气死室友）→ 命中后大方配合亮脐钉。
  {
    id: 'girl_uu',
    name: 'uu',
    type: '混合',
    tier: 3,
    resist: { 金钱: 1.0, 话术: 1.0, 才艺: 0.4, 颜值: 0.4 }, // 混合·难搞：仅金钱+话术有效（作者定 2026-06-15）
    counterPower: 13, // tier3 默认 11 之上，更难
    playsEnemySong: false,
    inChurnPool: true,
    introHook:
      '又连到 uu——在校学生、业余开播，跟同寝当主播的室友闹了点别扭（室友一晚顶她一个月）。说来好笑，这闷骚妹妹以前还举报过小猴猫嫌他低俗，如今倒天天来跟着谢礼物了。',
    introDialogue: [
      uuLines.intro,
      {
        who: 'monkey',
        text: '哟，uu？兄弟们，这位以前可是举报过我的，嫌我低俗。现在咋天天来给我谢礼物了？',
      },
      { who: 'girl', text: '（小声）……那是以前。就，习惯了你们这个氛围。' },
    ],
    captureScript:
      '〔金钱·呼应室友梗〕兄弟们把图鉴甩上来，气死她那个室友！……金钱攻略命中，闷骚妹妹大大方方亮了脐钉（最劲爆那下恰好卡在边线上）。',
    winDialogue: [
      uuLines.intro,
      {
        who: 'monkey',
        text: '哟，uu？我没看错吧，是你？兄弟们，这位以前可是举报过我的，嫌我低俗。',
      },
      { who: 'girl', text: '（小声）……那是以前。' },
      {
        who: 'monkey',
        text: '那现在呢？天天来我直播间，还跟着大伙儿一块谢礼物？好妹妹，喜欢上这种感觉了吗？',
      },
      { who: 'girl', text: '（闷闷地）……就习惯了你们这个氛围。' },
      {
        who: 'monkey',
        text: '从举报我到给我谢礼物，你挺上道啊妹妹。哎对了——（念弹幕）他们说你脚上有个纹身？真的假的？',
      },
      { who: 'girl', text: '（认真否认）我脚上没有纹身。……我脚上没有纹身，但是我肚脐上有脐钉。' },
      {
        who: 'monkey',
        text: '（懵了半秒）啊？你说啥？兄弟们！都别愣着，把礼物给我刷上来，人气票打满！你那室友一晚顶你一个月是吧？今天这一波，气死她！',
      },
      {
        who: 'narration',
        text: '礼物哗啦啦砸满了屏。uu 看着那波人气和打赏，她大大方方把镜头往下带了带，露出肚脐上那颗亮闪闪的脐钉，还故意停了两秒。这一下，把弹幕直接干沸了。最劲爆的那一下，镜头还是"恰好"卡在了边线上。',
      },
      {
        who: 'monkey',
        text: '（彻底绷不住）我滴乖——你你你这个！兄弟们这合理吗？对面真是好女孩啊！我不敢看了我真不敢看了。',
      },
      { who: 'girl', text: '（恢复矜持，小声）……就给你看一眼。' },
      {
        who: 'monkey',
        text: '这样，你正式加入我们猴猫传媒，当我们的猴女郎。以后跟着我连线搞节目，人气有了，钱也有了——你那室友不是一晚顶你一个月吗？我扶植一下你，把她比下去。',
      },
      { who: 'girl', text: '（不好意思又有点心动）……那、那行吧。' },
      {
        who: 'narration',
        text: '互关了。从举报小猴猫的人，到猴猫传媒旗下的猴女郎——uu 之前的敌人变成了队友，虽然她自己可能都没想到。',
      },
    ],
    loseDialogue: [
      { who: 'narration', text: '没盘好这块"前黑粉"，一上来就用力过猛——' },
      {
        who: 'monkey',
        text: '来来来 uu，他们说你脚上有纹身，你给大伙儿亮一下呗，肚脐也行，听说你有脐钉？',
      },
      {
        who: 'girl',
        text: '（皱眉，闷闷地）……你怎么还跟以前一样。我当初就是觉得你这样太低俗才举报你的。',
      },
      { who: 'girl', text: '（冷淡）我先去看看我室友那边，她叫我。拜拜。' },
      {
        who: 'monkey',
        text: '（讪讪）哎别走啊……哎呀，兄弟们不要捣乱，这个很安逸的。',
      },
      {
        who: 'narration',
        text: '闷骚归闷骚，分寸踩过了她可不惯着。黑转粉的那点好感，又被你作没了。',
      },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'uu_ouo.webp' },
        { key: 'won', src: 'uu_ouo_highlight.webp' },
      ],
    },
  },
  // ── #9 哈尼mm（混合 金钱+话术 tier3，girls/hanimm.md 真迹，作者拍板 2026-06-13）
  // 广东潮汕 60w 粉老练御姐；dom+擦边+拳套礼物玩疯+跳舞；收服=金钱(拳套刷疯)+话术(接住dom)组合拳。
  {
    id: 'girl_hanimm',
    name: '哈尼mm',
    type: '混合',
    tier: 3,
    resist: { 金钱: 1.0, 话术: 1.0 },
    looksGate: 100, // 须先剪 ASEN 造型才开窗（design §5.4 教学钩）
    playsEnemySong: false,
    inChurnPool: true,
    introHook:
      '连到哈尼mm——广东潮汕的大主播，60 多万粉，气场稳得很。自称这是"副业"，主业是"给粉丝的福利"（意味深长）。这块硬骨头，光擦边可镇不住，得金钱话术几手一块上。',
    introDialogue: [
      hanimmLines.introNarration,
      hanimmLines.youreBeautiful,
      hanimmLines.likeWangKaikai,
    ],
    captureScript:
      '〔金钱+话术·组合拳〕拳套刷疯了，满屏噗呲噗呲——这御姐的 dom 你也接住了。互关上了，这才是真正的直播。',
    moveReactions: {
      rhetoric: [
        [
          {
            who: 'monkey',
            text: '好妹妹，你那边收的全是我这边好兄弟的拳套，是不是得给我们表示表示？',
          },
        ],
        [
          {
            who: 'monkey',
            text: '你有六十万粉丝，我滴乖，你六十多万粉还说这是副业？那你主业是啥？',
          },
          { who: 'girl', text: '主业是啥？……给粉丝的福利。（意味深长的眼神）' },
          {
            who: 'monkey',
            text: '我也广东的，深圳。我到时候去潮汕当你粉丝，有没有那种正儿八经的线下福利？',
          },
          { who: 'girl', text: '嘻嘻，你猜。你做得好的话，自然会奖励，你知道吗？' },
        ],
      ],
      money: [
        [
          {
            who: 'narration',
            text: '小猴猫教她收拳套礼物——"谁给你刷，你就念他 ID 说我要拳你"。哈尼mm 一下玩疯了，满屏"噗呲噗呲"。',
          },
          {
            who: 'monkey',
            text: '好妹妹，你那边收的全是我这边好兄弟的拳套，是不是得给我们表示表示？',
          },
          { who: 'girl', text: '啊~ daddy 我要拳你，我要跟他噗呲噗呲。来，小脸蛋给我伸过来。' },
          { who: 'monkey', text: '（乖乖把脸凑过去，享受这一巴掌）我滴乖。' },
        ],
      ],
      cashDance: [
        [
          {
            who: 'narration',
            text: '小猴猫一段抓钱舞下去，哈尼mm 也跟着跳了段擦边舞——小猴猫盯着屏幕破了功："……黑色的。"最劲爆那下，照例卡在了边线上。',
          },
        ],
      ],
    },
    winDialogue: [
      { who: 'monkey', text: '好妹妹，你那边收的全是我这边好兄弟的拳套，是不是得给我们表示表示？' },
      { who: 'girl', text: '（跳完）哈尼妈妈祝全体猴子猴孙儿童节快乐！' },
      {
        who: 'narration',
        text: '（下播后）兄弟们，互关上了，互关上了——这个太对味儿了。这才是真正的直播。',
      },
    ],
    loseDialogue: [
      {
        who: 'narration',
        text: '猴子猴孙的猴头全起立了，弹幕炸了锅——"这个很安逸的"，"我滴乖"，"好妹妹"，"安逸"，"别摧毁了"，"这才是真正的直播" …… 哈尼mm 也没绷住，直接笑出声来了。',
      },
      {
        who: 'monkey',
        text: '好妹妹，你知道B站那些主播都有多机位不？下次你搞个多机位给大伙儿大大方方的展示一下呗。',
      },
      {
        who: 'girl',
        text: '（慢悠悠）你以为就你知道啊？我见过的场面，多了去了，叫你的粉丝别在我这刷屏了',
      },
      { who: 'girl', text: '行了，我这边还有事，下次吧。拜拜。' },
      {
        who: 'monkey',
        text: '兄弟们千万不要去对面摧毁，这个很安逸的，下次连到千万别摧毁了',
      },
      {
        who: 'monkey',
        text: '（讪讪）哎……这个是真的安逸，绝对火箭队名宿来的，可惜了。',
      },
      { who: 'narration', text: '这位眼光奇高，普通帅入不了她的眼。下回剪了 ASEN 的造型再问吧。' },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'hanimm.webp' },
        { key: 'reacting', src: 'hanimm2.webp' },
        { key: 'won', src: 'hanimm3.webp' },
      ],
    },
  },
  // ── #10 小蓝（颜控 tier3 · looksGate100，girls/blue.md 真迹，作者拍板 2026-06-13）
  // 颜控·眼光奇高：普通颜值不开窗，须先剪 ASEN 造型（颜值→100）她才夸你"朦胧帅"，
  // 颜值反问才命中——承接原"神颜阿满"的 ASEN 造型教学钩。带货土鸡蛋是人设 flavor。
  {
    id: 'girl_blue',
    name: '小蓝',
    type: '混合',
    tier: 3,
    resist: { 颜值: 1.0, 话术: 1.0, 才艺: 1.0, 金钱: 1.0 }, // 混合·不受克制（作者定 2026-06-15）
    looksGate: 100, // 须先剪 ASEN 造型才开窗（design §5.4 教学钩）
    playsEnemySong: false,
    inChurnPool: true,
    introHook:
      '又连到小蓝——广西的颜值博主，刚回老家张罗带货，这天顶着一身圣母玛利亚造型。眼光奇高，普通帅她不感冒——得有那个 ASEN 的范儿，她才正眼瞧你。',
    introDialogue: [
      {
        who: 'narration',
        text: '又连到小蓝——广西的颜值博主，刚回老家张罗带货，顶着一身圣母玛利亚造型。眼光高得很。',
      },
      { who: 'monkey', text: 'Hello 小蓝。你今天搞的什么造型？这个是圣女吗？' },
      { who: 'girl', text: '你觉得是什么造型？好看吗？' },
    ],
    captureScript:
      '〔颜值反问·朦胧帅（须 ASEN 造型开窗）〕有没有点痞帅？……朦胧帅。对，那你现在就是我们猴女郎其中一员了。',
    winDialogue: [
      {
        who: 'narration',
        text: '又连到小蓝——广西颜值博主，刚回老家张罗带货，顶着圣母玛利亚造型。眼光高得很，得先剪一个ASEN的造型她才正眼瞧你。',
      },
      {
        who: 'monkey',
        text: 'Hello 小蓝，你今天这造型，圣母玛利亚吧？I say mama you raise the genius，圣母玛利亚 mother of jesus——牛和马的玛利亚，专门送给你的。',
      },
      { who: 'girl', text: '哇哦那很好欸，圣母玛利亚好看吗？' },
      { who: 'monkey', text: '（顶着 ASEN 造型凑近）有没有点痞帅？' },
      { who: 'girl', text: '（嗔怪）脸都看不清还帅呢。……（看了两眼）有点痞帅，朦胧帅。对。' },
      {
        who: 'narration',
        text: '颜值反问命中——剪了 ASEN 造型这一手，到底把眼光奇高的小蓝拿下了。',
      },
      { who: 'monkey', text: '你这两天播啥？听说你在张罗带货？' },
      {
        who: 'girl',
        text: '是的，好会分析。我卖外婆手工缝的布鞋、村民养的土鸡土鸭，真空包装顺丰冷链。',
      },
      { who: 'monkey', text: '有点东西。他们说你那有没有土鸡蛋？' },
      { who: 'girl', text: '有啊有啊，当然有，你喜欢说。' },
      {
        who: 'monkey',
        text: '土鸡蛋是我发明的梗，说唱圈现在都在用，形容那种土包子。你大大方方卖点土鸡蛋，咱连线带货有效果。',
      },
      { who: 'girl', text: '好呀好，到时候我给你们送点。' },
      { who: 'monkey', text: '你有空研究下我们这个猴猫宇宙，挺有意思的。' },
      { who: 'girl', text: '我知道猴女郎。' },
      {
        who: 'monkey',
        text: '对，那你现在就是我们猴女郎其中一员了，被我纳入猴女郎了。你这人气，top three 级别。',
      },
      { who: 'girl', text: '（不好意思地笑）真的？这么有趣。' },
      {
        who: 'narration',
        text: '互关了。小蓝顶着圣母玛利亚的造型，笑着应下了 top three 的名头。',
      },
    ],
    loseDialogue: [
      { who: 'narration', text: '这位眼光奇高——你这平平无奇的样子，怕是入不了她的眼。' },
      { who: 'monkey', text: '有没有点痞帅？' },
      { who: 'girl', text: '（瞥一眼，没什么表情）……就那样吧。脸都看不清，也没看出哪儿帅。' },
      { who: 'monkey', text: '这种朦胧的、朦胧的感觉——' },
      { who: 'girl', text: '朦胧是朦胧，帅倒谈不上。（转头看带货后台）我这还得忙我那摊子货呢。' },
      { who: 'narration', text: '颜值反问落了空——她压根没开口夸你，这一手就没接上。' },
      {
        who: 'monkey',
        text: '（讪讪）得，人家眼光高，我这造型还没到位。看来真得去剪个 ASEN 的造型，把颜值拉满，她才肯正眼瞧。',
      },
      { who: 'narration', text: '普通帅入不了她的眼。下回剪了 ASEN 的造型再来吧。' },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'blue1.webp' },
        { key: 'reacting', src: 'blue1.webp' },
        { key: 'won', src: 'blue2.webp' },
      ],
    },
  },

  // ── 隐藏第 11 · Mulasakee（神秘嘉宾·终局；不计入必需 10。平时连不上他，只有赛季最后一天满足
  //    条件时他主动空降——见 progression.sakeeShowsUp / girls/mulasakee.md 定稿）。
  //    机制=普通混合(颜值+才艺)对手，往常方式赢下；
  //    重量在赢之后的「21 问」（winDialogue）。赢下≠收服：结算不计 signedCount、不进后宫产出，
  //    见 battleEngine.applyBattleResult / gameLoop.passivePayout 的 isHidden 守卫。
  {
    id: 'girl_hidden_11',
    name: 'Mulasakee',
    type: '混合',
    tier: 4,
    resist: { 颜值: 1.0, 才艺: 1.0 },
    isHidden: true,
    inChurnPool: false,
    introHook: '最后一天。连麦请求进来了——弹幕先认出了他，你才跟上。',
    introDialogue: [
      {
        who: 'narration',
        text: '最后一天。进度条将满，阵容完整。连麦请求进来的时候，弹幕先炸了——你才认出那个头像。',
      },
      {
        who: 'narration',
        text: '「永玄神武！」「Digi 的 Sakee 来了！」「小猴猫，斩！」「玄尬是来干嘛的」弹幕直接炸锅了。',
      },
      { who: 'girl', text: '孤旁观十八日了。今日，孤要亲自来看一眼。' },
      { who: 'monkey', text: '（笑）不尬不尬，等下我让我猴子猴孙送你点图鉴。' },
    ],
    captureScript:
      '〔赢下了，可Sakee却没走——他卸下了那股腔调，一个一个把问题抛给你。问完，没等回答，就下了播。〕',
    // 赢后「21 问」（mulasakee.md 定稿）：化用 ASEN《21个问题》真句 + 两记《英雄》暗器；
    // Sakee 从文言切回大白话，小猴猫全程沉默，每句之间靠打字机留白。
    winDialogue: [
      // ── 独白：Sakee 败后认输，文言腔开始松动
      {
        who: 'narration',
        text: '小猴猫击败了 Sakee。Sakee 先是沉默了好几秒，随后缓缓开口——那股「永玄大帝」的腔调，开始慢慢落了下去。',
      },
      { who: 'girl', text: '孤……负此局。（停了一下）……孤认。' },
      {
        who: 'girl',
        text: '孤旁观十八日，所见颇多。你唱着那首歌、顶着那个造型、一路招揽妹妹——这套路，你用得很顺。',
      },
      {
        who: 'girl',
        text: '孤今有数问，猴卿可愿答之？',
      },
      {
        who: 'narration',
        text: ' Sakee 说完这句，停了好几秒。小猴猫也沉默着，等了好几秒，才说「愿意」。',
      },
      // ── 21 问：Sakee 切回大白话，小猴猫全程沉默
      { who: 'girl', text: '你天天在这儿直播，追求的是啥子？你想成为哪个？' },
      { who: 'girl', text: '你每天插科打诨、扮丑、整活——你想给这个世界带来点啥子？' },
      { who: 'girl', text: '你那些半真半假的人设，是一条路走到黑，还是……对你自己撒的谎？' },
      {
        who: 'girl',
        text: '你会不会为了那点流量、那点礼物，说几句谎话？你心里清楚得很——有人，把你说的话当真了。',
      },
      {
        who: 'girl',
        text: '歌里唱的——「骗哈儿妹妹，你不可能走到最后」。你这一后宫的妹妹，哪个不是你骗进来的？',
      },
      {
        who: 'girl',
        text: 'ASEN说他是「大闹天宫后的美猴王」。你这身猴皮，是不是也是从他那句里扒下来的？',
      },
      { who: 'girl', text: '等哪天唱《英雄》不涨粉了、不帅了，你还唱不唱？' },
      {
        who: 'girl',
        text: '你收了一屋子人，猴女郎，猴子猴孙。当你只剩那点互联网上的流量了，回头看——身后面还有没有人？',
      },
      { who: 'girl', text: '（停了很久）……今后的路，该怎么走啊？' },
      {
        who: 'narration',
        text: '他问完了，没等回答。屏幕静下来。弹幕一条也没有，过了好几秒，才稀稀拉拉飘出几个「？」。小猴猫盯着屏幕，没说话。',
      },
    ],
    assets: {
      scenes: [
        { key: 'idle', src: 'mulasakee.webp' },
        { key: 'reacting', src: 'mulasakee.webp' },
        { key: 'won', src: 'mulasakee.webp' },
      ],
    },
  },
];

// ───────────────────────── 死对头主播（非后宫 Boss） ─────────────────────────
// 艾德：男主播，思小捌+豆包妹都收服后向小猴猫发起连线挑战。脚本化必败→必胜：
// 阈值不可达、高反击磨精力，精力快耗尽时吉奥雷送跑车救场强判 WIN，并教会小猴猫 singHero。
// 复用 MonkeyGirlDef 与战斗引擎（同 Mulasakee 的 isHidden 套路），但 isRival 让它不计入
// 收服 10、不进图鉴/流失池/被动产出。台词/配图全为占位（TBD-作者，等风格参考再定稿）。
export const RIVALS: MonkeyGirlDef[] = [
  {
    id: 'rival_aide',
    name: '艾德',
    type: '才艺', // 占位：具体克制口味待定（反正阈值不可达，数值仅决定"打着费不费劲"）
    // tier 对死对头是装饰字段：艾德不走粉丝 tier 门控，由连线事件（思小捌+豆包妹已收服）触发，
    // 阈值/反击取自 balance.rival。设 1 仅表"前期 Boss"——他必须先于幼师被击败（幼师需 singHero）。
    tier: 1,
    isRival: true,
    noFail: true, // 不会"打输"：阈值不可达，精力磨到 rescueAt 由 gameLoop 触发救场强判 WIN
    captureThreshold: balance.rival.threshold,
    counterPower: balance.rival.counterPower,
    introDialogue: [
      { who: 'narration', text: '哇，爆了爆了，小猴猫连上了re圈一哥艾德！' },
      { who: 'narration', text: '小猴猫心生疑惑：明明艾德已经把自己拉白了，怎么会主动前来连麦？' },
      {
        who: 'girl',
        text: '一想到要跟你连麦，我就有点近乡情更怯啊，要接近一个不敢触碰之人，我也是鼓足了十分的勇气。',
      },
      { who: 'monkey', text: '（笑）不敢触碰在哪？你不是天天触摸我吗？就像我天天拷打王以大一样。' },
      {
        who: 'girl',
        text: '王以大都有人黑啊？......nb。你天天点评这个那个的，你有什么作品啊？小猴猫？',
      },
      {
        who: 'monkey',
        text: '“爆了爆了”创始人，“肚肚笑炸”创始人，“闹得麻麻的创始人”，“原创梗”创始人，“土鸡蛋”创始人，“猴猫家族”创始人，“猴猫宇宙”创始人，“猴猫兵团”创始人，“猴猫集团”创始人，“猴猫兵团”创始人，“猴猫帝国”创始人，“蛋仔派对”创始人，等等一系列创始人 -- 小猴猫',
      },
      {
        who: 'monkey',
        text: '"套娃直播"创始人，“说唱鄙视链”创始人，“说唱红黑榜”创始人，“说唱斗兽笼”创始人，“说唱听众图鉴”创始人，“猴女郎”创始人，“猴子猴孙”创始人',
      },
      {
        who: 'monkey',
        text: '（笑）《你有什么作品》也是小猴猫原创梗。那话说回来了，艾德，你又有什么作品？',
      },
      {
        who: 'girl',
        text: '艾志恒的《英雄》，有没有我的合作？我的代表作是不是《在雨后醒来》里面的一首歌，叫《英雄》？',
      },
      {
        who: 'monkey',
        text: '（笑）还真是啊，还真是。那咱俩打一把pk，我赢了你，你教我唱《英雄》吧。',
      },
      { who: 'girl', text: '来来来，我就要看看今天谁爆的多！' },
    ],
    captureScript: '吉奥雷送来跑车后，小猴猫翻盘、艾德认栽、并教会小猴猫《英雄》的收尾台词。',
    winDialogue: [
      {
        who: 'narration',
        text: '小猴猫苦战好几个回合，眼看拿不下艾德，就在这时，吉奥雷的大跑车大大方方的开进了直播间！',
      },
      { who: 'narration', text: '扶大厦之将倾，挽狂澜于既倒，这就是吉奥雷。' },
      {
        who: 'monkey',
        text: '感谢我吉奥雷好兄弟的跑车啊！感谢！年轻猴猫开supra，吉奥雷坐在副驾！',
      },
      { who: 'narration', text: '小猴猫战胜了艾德。以后可以公式唱《英雄》了。' },
    ],
    // 艾德立绘自始至终用 adb.webp（各场景同一张）
    assets: {
      scenes: [
        { key: 'idle', src: 'adb.webp' },
        { key: 'reacting', src: 'adb.webp' },
        { key: 'won', src: 'adb.webp' },
        { key: 'lost', src: 'adb.webp' },
      ],
    },
    // 小猴猫立绘：对战中用痞帅图，战胜（won）用吉奥雷送的跑车图
    monkeyPortraits: {
      idle: 'lmc_pishuai.webp',
      reacting: 'lmc_pishuai.webp',
      lost: 'lmc_pishuai.webp',
      won: 'lmc_jiaolei.webp',
    },
  },
];

export const GIRLS_BY_ID: Record<string, MonkeyGirlDef> = Object.fromEntries(
  [...MONKEY_GIRLS, ...RIVALS].map((g) => [g.id, g]),
);

export function girlDef(id: string): MonkeyGirlDef {
  const def = GIRLS_BY_ID[id];
  if (!def) throw new Error(`未知猴女郎 id: ${id}`);
  return def;
}

/** 艾德等死对头的 id（HubScreen / events 引用，避免散落字面量）。 */
export const RIVAL_AIDE_ID = 'rival_aide';

// 含死对头：让 initState 给艾德注册运行时槽（否则进对战读 girls[id] 为空会崩）。
export const ALL_GIRL_IDS = [...MONKEY_GIRLS, ...RIVALS].map((g) => g.id);
