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
  actions: {
    variety: { energy: -25, fans: 800, fansJitter: 0.25, money: 500, stress: +35 }, // 看综艺
    listen: { energy: -10, fans: 150, money: 200, talent: +2 }, // 听歌
    cereal: { energy: +50, moneyBase: -300, priceStep: 150 }, // 首次¥300，每次多¥150
    // 大秀的产出在 battle 段
  },

  stress: { perVariety: +35, idleDecay: -10, overflowRestDays: 2 }, // 压力（原"内伤"）

  battle: {
    winFans: +500,
    loseFans: -300,
    winTip: +400,
    winRhetoric: +1,
    loseRhetoric: +3, // 越战越强核心：失败给话术经验
    // 大秀各出招的精力成本（design §5.2 step1；PRD 未给明值，TBD 待试玩调）
    moveCostEnergy: { money: 2, rhetoric: 8, singHero: 10, cashDance: 10, looks: 6 },
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
  enlightenMul: 2.0, // 感化暴击 ×2（放敌人歌 + 唱《英雄》）

  loveAtFirstSightBonus: 50, // 颜值反问命中 +50
  loveLooksGate: 70, // 颜值达标线（已确认=70；ASEN 造型留作对混合型奇效）

  // 喜好显形（design §5.7 两档）
  revealStrongGate: 2.0, // coef≥此 → 标"克制·暴击级"
  revealSoftGate: 0.5, // coef>此（非"不对口"）→ 标"似乎吃这套"（混合型靠它显形）

  asenStyle: { cost: 1500, looksTo: 100 }, // ASEN 造型一次性 ¥1500 → 颜值100

  moneyMove: { costMoneyPerUse: 100 }, // 金钱攻略每次刷礼物默认投入

  // 已收服后宫被动产出（PRD 4.5）
  payoutByTier: {
    1: { moneyPerDay: 80, fansPerDay: 10 },
    2: { moneyPerDay: 120, fansPerDay: 17 },
    3: { moneyPerDay: 160, fansPerDay: 24 },
    4: { moneyPerDay: 200, fansPerDay: 30 },
  },

  // tier 门控（粉丝里程碑 → 可挑战的 girl.tier 档，PRD 2.5）
  // tiers = 可挑战的 girl.tier 档位（非 girl id）。
  tierGate: [
    { fansMin: 91000, fansMax: 92000, tiers: [1] },       // 9.1万解锁 tier1
    { fansMin: 92000, fansMax: 95000, tiers: [1, 2] },    // 9.2万解锁 tier2
    { fansMin: 95000, fansMax: 98000, tiers: [1, 2, 3] }, // 9.5万解锁 tier3
    { fansMin: 98000, fansMax: 100000, tiers: [1, 2, 3, 4] }, // 9.8万解锁 tier4
  ],
  // 隐藏第 11（isHidden）不靠粉丝门控——见 progression.sakeeShowsUp：最后一天 + 粉丝十万 +
  // 收服满10 + 阵容完整（除单单外无流失）时他主动空降（design §7.5 / mulasakee.md 定稿）。

  whale: {
    retainChance: 0.05, // 单单：纯 5% 留存掷骰（PRD 4.7）
    activeDays: 6, // TBD：单单高产期天数（净②贡献受控）
    payout: { moneyPerDay: 600, fansPerDay: 250 }, // TBD：鲸鱼档大额产出
  },
  churn: { poolSizeMin: 1, poolSizeMax: 2, minDay: 15 }, // 常规流失 1-2 个，赛季中后期起（PRD 4.6a）

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
    looksBaseStart: 70,
  },

  // 文本
  text: { cps: 40 }, // 打字机字符/秒（design §15.2）

  difficulty: 'B-compact', // PRD 4.4 = B 紧凑
} as const;

export type Balance = typeof balance;
