/**
 * 平衡配置 —— PRD 4.3/4.4 的全部数字集中于此（design §6）。
 * 逻辑层只引用键名，禁止散落字面量；调参只改这一处。
 *
 * 全部数值标 **TBD（待试玩调参）**：这是 PRD 给定的自洽起始点，
 * 由 §5.8 配速回归测试作为调参护栏。
 */
export const balance = {
  resources: {
    energyMax: 100,
    energyStart: 100,
    energyDailyRegen: 5, // 精力每日被动恢复
    moneyStart: 0,
    fansStart: 90000,
    fansGoal: 100000,
    stressMax: 100,
  },

  // PRD 4.3 行为表（核心循环 2026-06-13 重构：1天=精力预算、可多动作、自己下播收工）
  // 难度调参 2026-06-15：大幅削弱"纯刷综艺涨粉"——单靠看综艺/听歌 18 天攒不到十万，
  // 必须靠收服猴女郎的被动产出（后半季滚雪球）才能在最后 3 天破十万。
  actions: {
    variety: { energy: -25, fans: 180, fansJitter: 0.25, money: 500, stress: +35 }, // 看综艺
    listen: { energy: -10, fans: 30, money: 200, talent: +1 }, // 听歌
    cereal: { energy: +50, moneyBase: -300, priceStep: 150 }, // 首次¥300，每次多¥150
    // 大秀的产出在 battle 段
  },

  stress: { perVariety: +35, idleDecay: -10, overflowRestDays: 2 }, // 压力（原"内伤"）

  battle: {
    winFans: +880,
    loseFans: -300,
    winTip: +400,
    winRhetoric: +1,
    loseRhetoric: +3, // 越战越强核心：失败给话术经验
    // 大秀各出招的精力成本（design §5.2 step1；PRD 未给明值，TBD 待试玩调）
    // 难度调参 2026-06-15：话术降到 5（才艺前置门逼着先聊完话术，故让聊天便宜些，不至于光聊就把精力耗光）
    moveCostEnergy: { money: 2, rhetoric: 5, singHero: 10, cashDance: 10, looks: 6 },
  },

  capture: { requiredTotal: 10 }, // 通关需累计收服 10（PRD 1.10①）

  // 攻陷
  threshold: { 1: 100, 2: 140, 3: 180, 4: 220 }, // 各 tier 攻陷阈值
  counter: { 1: 5, 2: 8, 3: 11, 4: 14 }, // 各 tier 反击/回合

  // 攻略强度乘子
  rhetoricMul: 2, // 话术 = lvl×2
  talentMul: 2, // 才艺 = lvl×2
  moneyMul: 8, // 金钱 = ¥/100 ×8
  looksMul: 0.6, // 颜值 = 颜值×0.6

  // 克制系数
  coefOnType: 2.0,
  coefOffType: 0.5,
  coefMixed: 1.0,

  decayBase: 0.6, // 重复衰减 0.6^(n-1)
  enlightenMul: 1.0, // 感化暴击 ×2（放敌人歌 + 唱《英雄》）

  loveAtFirstSightBonus: 50, // 颜值反问命中 +50
  loveLooksGate: 70, // 颜值达标线（已确认=70；ASEN 造型留作对混合型奇效）

  // 喜好显形（design §5.7 两档）
  revealStrongGate: 2.0, // coef≥此 → 标"克制·暴击级"
  revealSoftGate: 0.5, // coef>此（非"不对口"）→ 标"似乎吃这套"（混合型靠它显形）

  asenStyle: { cost: 10000, looksTo: 100 }, // ASEN 造型一次性 ¥10000 → 颜值100

  moneyMove: { costMoneyPerUse: 1000 }, // 金钱攻略每次刷礼物默认投入

  // 已收服后宫被动产出（PRD 4.5）
  // 难度调参 2026-06-15：后宫产出是破十万的主引擎。压低单档日产，使其靠"收服越多→雪球越大"
  // 在后半季累积爆发——单收一两个不够，须凑满阵容才能在最后 3 天压线破十万。
  payoutByTier: {
    1: { moneyPerDay: 80, fansPerDay: 20 },
    2: { moneyPerDay: 120, fansPerDay: 30 },
    3: { moneyPerDay: 160, fansPerDay: 40 },
    4: { moneyPerDay: 200, fansPerDay: 50 },
  },

  // tier 门控（粉丝里程碑 → 可挑战的 girl.tier 档，PRD 2.5）
  // tiers = 可挑战的 girl.tier 档位（非 girl id）。
  // 难度调参 2026-06-15：粉丝曲线被大幅放缓后，旧里程碑(9.2/9.5/9.8万)会让 tier3/4 直到最后几天才解锁、
  // 根本来不及收满 10 个。这里把门槛压进新曲线能企及的区间，使各 tier 在赛季中段依次开放。
  tierGate: [
    { fansMin: 85000, fansMax: 91000, tiers: [1] }, // 开局即可连 tier1（下限 8.5万防早期掉粉被锁）
    { fansMin: 91000, fansMax: 92500, tiers: [1, 2] }, // ~9.1万解锁 tier2
    { fansMin: 92500, fansMax: 94000, tiers: [1, 2, 3] }, // ~9.25万解锁 tier3
    { fansMin: 94000, fansMax: 100000, tiers: [1, 2, 3, 4] }, // ~9.4万解锁 tier4
  ],
  // 隐藏第 11（isHidden）不靠粉丝门控——见 progression.sakeeShowsUp：最后一天 + 粉丝十万 +
  // 收服满10 + 阵容完整（除单单外无流失）时他主动空降（design §7.5 / mulasakee.md 定稿）。

  whale: {
    retainChance: 0.05, // 单单：纯 5% 留存掷骰（PRD 4.7）
    activeDays: 6, // TBD：单单高产期天数（净②贡献受控）
    payout: { moneyPerDay: 600, fansPerDay: 300 }, // TBD：鲸鱼档大额产出（难度调参 2026-06-15）
  },
  churn: { poolSizeMin: 1, poolSizeMax: 2, minDay: 15 }, // 常规流失 1-2 个，赛季中后期起（PRD 4.6a）

  // 死对头艾德对战（脚本化 Boss）：阈值不可达（怎么打都收不掉），靠高反击快速磨精力；
  // 精力≤rescueAt 时必然触发吉奥雷送跑车救场 → 强判 WIN、习得 singHero。全部 TBD 待试玩调参。
  rival: {
    threshold: 999999, // 攻陷阈值不可达：唯一了结靠救场脚本
    counterPower: 18, // 每回合反击（磨精力，让"打一会儿"后必然见底）
    rescueAt: 25, // 精力≤此值 → 触发吉奥雷救场（>0，确保救场先于精力归零）
    challengeChance: 0.6, // 满足前置（思小捌+豆包妹已收服）后，每次收工掷出连线挑战的概率
  },

  // 赛季日历
  calendar: {
    startDate: '2026-06-16',
    endDate: '2026-07-03',
    totalDays: 18,
  },

  // 玩家初始属性（design §4.1 stats）
  stats: {
    rhetoricStart: 10,
    talentStart: 5,
    looksBaseStart: 60,
  },

  // 文本
  text: { cps: 30 }, // 打字机字符/秒（design §15.2）

  difficulty: 'B-compact', // PRD 4.4 = B 紧凑
} as const;

export type Balance = typeof balance;
