/**
 * 全局类型骨架 —— design §4 数据模型。
 * 带 `// TBD-作者` 的字段值由作者素材填充，结构先定下来接住它。
 *
 * 分层纪律（design §3.1）：领域逻辑层是纯函数 f(state,input)=>newState，
 * 不碰 DOM；运行时状态进 GameState，静态设定进内容层（MonkeyGirlDef 等）。
 */

// ───────────────────────── 出招 / 攻略类别 ─────────────────────────

/** 玩家在大秀里的出招类别；唱歌与抓钱舞同属"才艺"、共享重复衰减（PRD 2.4 / 5.3） */
export type MoveCategory = '金钱' | '话术' | '才艺' | '颜值';

export type MoveKey = 'money' | 'rhetoric' | 'singHero' | 'cashDance' | 'looks';

export interface MoveDef {
  key: MoveKey;
  label: string; // 按钮文案：金钱/话术/唱歌·英雄/跳抓钱舞/颜值
  category: MoveCategory; // 衰减/克制按"类别"算（唱歌+抓钱舞都属"才艺"）
  costEnergy: number;
  costMoneyPerUse?: number; // 金钱攻略本次刷礼物投入
  canEnlighten?: boolean; // 仅"唱歌·英雄"对放敌人歌目标 ×2
}

// ───────────────────────── 猴女郎：静态设定 vs 运行时 ─────────────────────────

export type GirlType = '颜控' | '话术' | '才艺' | '金钱' | '混合';

export type SceneKey = 'idle' | 'reacting' | 'won' | 'lost' | 'churned';

export interface GirlAssets {
  scenes: Array<{ key: SceneKey; src: string; alt?: string; objectPosition?: string }>;
}

/** 收服/失败时的完整对话（PK 结算展示全台词，作者要求 2026-06-13）。 */
export interface DialogueLine {
  who: 'narration' | 'monkey' | 'girl';
  text: string;
}

/** 静态设定：content/monkeyGirls.data.ts，作者按模板对号入座（PRD 3.4） */
export interface MonkeyGirlDef {
  id: string; // 稳定主键，如 "girl_03"
  name: string; // 主播名 / handle            // TBD-作者
  type: GirlType; // 决定吃哪种攻略
  tier: 1 | 2 | 3 | 4; // 粉丝门控档位（PRD 2.5）
  captureThreshold?: number; // 攻陷阈值（不写取 balance.threshold[tier]）

  /** 各攻略克制系数；不写则由 type 推导默认（design §5.3） */
  resist?: Partial<Record<MoveCategory, number>>;

  counterPower?: number; // 反击强度（不写取 tier 默认）
  playsEnemySong?: boolean; // 初见放敌人歌 → 唱《英雄》感化暴击（PRD 3.1）
  enemySongRef?: string; // 放的是谁的歌（线索文本）       // TBD-作者

  introHook?: string; // 初见 hook / 诊断式线索文案（无 introDialogue 时作旁白兜底）  // TBD-作者
  introDialogue?: DialogueLine[]; // 连线开场对话（她在干嘛 + 你俩对上话，BATTLE_INTRO）
  captureScript: string; // 收服桥段/关键台词（无 winDialogue 时的兜底）  // TBD-作者
  winDialogue?: DialogueLine[]; // 收服全对话（结算展示；无则用 captureScript）
  loseDialogue?: DialogueLine[]; // 失败全对话（无则用通用失败文案）
  // 逐招对白（PK 中点某招 → 放出对应剧情对话，逐字打字机）。每招一组"beat"，
  // 第 n 次用该招取 beats[min(n, len-1)]（可递进）；未填的招走中性旁白兜底。
  moveReactions?: Partial<Record<MoveKey, DialogueLine[][]>>;

  assets: GirlAssets; // 2-3 张场景图（design §10）
  // 本场对战专属的「小猴猫」立绘覆盖（按场景）：设了则该场景不走全局随机 MONKEY_PORTRAITS。
  // 用于剧本 Boss（如艾德对战小猴猫用痞帅图、战胜用跑车图）。文件名指向 /pweb。
  monkeyPortraits?: Partial<Record<SceneKey, string>>;

  payout?: { moneyPerDay: number; fansPerDay: number }; // 不写取 tier 默认（PRD 4.5）

  // 攻略限定（design §5.5）：设了则用别的才艺出招直接判负（豆包妹/幼师='singHero'）
  requiredTalent?: MoveKey;
  // 收服前置招（2026-06-15）：设了则攻陷前必须至少用过这一招，否则进度再高也收不了
  // （幼师='singHero'：不唱《英雄》无论如何收不掉，但其余攻略照常累积进度）。
  requiredMove?: MoveKey;
  // 无失败型（design §5.4）：思小捌 —— 必收服、无失败结局
  noFail?: boolean;
  // 个人颜控阈值（design §5.4）：颜值达此线才"开窗"夸你；不写取 balance.loveLooksGate(70)。
  // #9 神颜阿满=100 → 须先剪 ASEN 造型才开窗。
  looksGate?: number;

  isWhale?: boolean; // 单单（鲸鱼特例，PRD 4.6b）
  inChurnPool?: boolean; // 是否进常规流失随机池（单单不进，PRD 4.6a）
  isHidden?: boolean; // 隐藏第 11（PRD 1.11a，不计入必需 10）
  // 死对头主播（艾德）：非后宫的剧本 Boss。不计入收服 10、不进图鉴/流失池/被动产出。
  // 攻陷阈值设为不可达，唯一了结方式是「精力快耗尽 → 吉奥雷送跑车救场」脚本化必胜（见 gameLoop）。
  isRival?: boolean;
}

export type GirlStatus = 'unmet' | 'signed' | 'churned';

/** 运行时状态：存进 GameState.girls[id] */
export interface MonkeyGirlRuntime {
  id: string;
  status: GirlStatus;
  attempts: number; // 收服尝试次数（越战越强语义记录）
  revealedWeakness: MoveCategory[]; // 已"试出显形"的喜好（半隐藏，PRD 5.3）
  daysSinceSigned?: number; // 经营产出/单单高产期计时
}

// ───────────────────────── 战斗运行态 ─────────────────────────

export interface BattleLogEntry {
  turn: number;
  text: string;
  delta: number;
}

export interface BattleState {
  girlId: string;
  threshold: number;
  captureProgress: number; // 达 threshold 即收服
  energyAtStart: number;
  turn: number; // ≥1
  categoryStreak: Record<MoveCategory, number>; // 各类别连用次数（重复衰减，按 category）
  lastCategory?: MoveCategory; // 换类别则对应 streak 归零（design §5.3 (i) 完全恢复）
  loveAtFirstSightApplied: boolean; // 颜值反问 bonus 仅一次
  complimentOpen: boolean; // 颜控妹妹"开窗"夸你帅，可接颜值反问（design §5.4）
  revealedThisBattle: MoveCategory[]; // 本场试出的克制（喂回 runtime.revealedWeakness）
  display: { monkeyScene: SceneKey; girlScene: SceneKey }; // 驱动 UI 实时换图（PRD 5.3）
  log: BattleLogEntry[];
  dialogue?: DialogueLine[]; // 实时对话流：开场 introDialogue 起，每出招追加逐招对白
  moveUses?: Partial<Record<MoveKey, number>>; // 各招本场使用次数（驱动 moveReactions 递进）
  result?: 'win' | 'lose';
  fled?: true; // 玩家主动认输（区别于出招失败）
}

// ───────────────────────── 事件 ─────────────────────────

export interface ResourceDelta {
  energy: number;
  money: number;
  fans: number;
  stress: number;
}

export type EventKind =
  | 'flavor' // 碎片涌现叙事（PRD 3.3）
  | 'churn' // 常规流失·公平可避（4.6a）
  | 'whale' // 单单剧本特例（4.6b）
  | 'hidden' // 提前达标隐藏内容（1.11a）
  | 'rival'; // 死对头主播艾德的连线挑战（接受/拒绝）

export interface EventTrigger {
  minDay?: number;
  maxDay?: number;
  requireFlags?: string[]; // 全部为 true 才触发
  forbidFlags?: string[]; // 任一为 true 则不触发
  requireSignedGirl?: string; // 需已收服某猴女郎（流失事件指向具体人）
  requireSignedGirls?: string[]; // 需"同时"已收服列表里全部猴女郎（如艾德挑战需思小捌+豆包妹都收服）
  requireAllGoalsMet?: boolean; // = capturedTen && fansReached（不含 seasonEnded，design §7.5）
  chance?: number; // 该窗口每次 EVENT_CHECK 触发概率（种子化 RNG）
}

/** churn 事件目标占位符：bind 时替换为随机选中的已收服猴女郎 id（§7.4）。 */
export const CHURN_TARGET = '$target';

export interface EventOutcome {
  effects?: Partial<ResourceDelta>; // 走 economy.applyDelta 钳制（design §6.1）
  churnGirlId?: string; // 触发某猴女郎永久流失（signedCount 不回退）；churn 模板用 CHURN_TARGET 占位
  setFlags?: Record<string, boolean | number>;
  // 单单专用：纯 5% 留存掷骰（投入不改概率，§7.3）。keep/churn 两段结局文案随掷骰展示。
  whaleRetainRoll?: { keepChance: number; keepText: string; churnText: string };
  // 死对头连线挑战"接受"专用：设了则结算后不进天，当场进入该死对头的对战（值为其 id）。
  enterRivalBattle?: string;
  text?: string; // 结果文案                          // TBD-作者
  img?: string; // 结算结果配图（pweb 文件名，随 flash toast 展示）
}

export interface EventChoice {
  text: string; // 选项文案                            // TBD-作者
  gatedByRhetoricLvl?: number; // 达到等级才显形/标安全（PRD 4.6a）
  outcome: EventOutcome;
}

/** 统一事件模型（PRD 1.11 / 4.6） */
export interface GameEvent {
  id: string;
  kind: EventKind;
  trigger: EventTrigger;
  text: string; // 主文案（打字机渲染）               // TBD-作者
  image?: string; // 事件插图（pweb 文件名，弹窗顶部展示）
  choices?: EventChoice[]; // 无选项=纯叙事弹窗
  oneShot?: boolean;
  weight?: number; // 随机池权重
}

export interface EventLogEntry {
  day: number;
  eventId?: string;
  text: string; // 已结算的叙事记录（图鉴/回放用）
}

// ───────────────────────── 歌单 ─────────────────────────

/** content/songs.data.ts —— ASEN 系曲目，《英雄》已定（PRD 2.6） */
export interface SongDef {
  id: string;
  title: string; // 《英雄》等                          // TBD-作者（除《英雄》）
  artist: string; // 艾志恒 ASEN
  isHero?: boolean; // 才艺/感化母题
  flavor?: string; // 听歌 flavor 文案                  // TBD-作者
}

// ───────────────────────── 全局 GameState ─────────────────────────

export type GamePhase =
  | 'BOOT'
  | 'TITLE'
  | 'DAY_HUB'
  | 'RESOLVE_ACTION'
  | 'BATTLE'
  | 'EVENT_CHECK'
  | 'ADVANCE_DAY'
  | 'END_CHECK'
  | 'ENDING';

export interface WinConditionState {
  capturedTen: boolean; // 累计收服 ≥10
  fansReached: boolean; // 粉丝 ≥100000
  seasonEnded: boolean; // 到达 7/4
}

export type EndingType = 'WIN' | 'LOSE_INCOMPLETE' | 'HIDDEN_CONTENT';

/** 整局存档的唯一根对象。任何会变的运行时状态都挂这里。 */
export interface GameState {
  version: number; // schema 版本，用于存档迁移
  rngSeed: number; // 当前周目种子，保证可复现
  phase: GamePhase;

  calendar: {
    startDate: string; // "2026-06-05"
    endDate: string; // "2026-07-04"
    currentDay: number; // 1..totalDays
    totalDays: number;
    forcedRestDaysLeft: number; // 压力爆表强制停播剩余天数
  };

  resources: {
    energy: number; // 0..100
    money: number; // ≥0
    fans: number; // 90000..（可超 100000）
    stress: number; // 0..100（原"内伤"）
    cerealBought: number; // 累计买麦片次数，驱动阶梯涨价
  };

  stats: {
    rhetoricLvl: number; // 话术等级（起 10）
    talentLvl: number; // 才艺等级（起 5）
    looksBase: number; // 颜值基础（起 70）
    asenStyle: boolean; // 是否已剪 ASEN 造型（颜值拉满 + 破适应）
  };

  capture: {
    signedCount: number; // 累计收服计数（流失仍计入，PRD 1.10①）
    requiredTotal: number; // 10
  };

  girls: Record<string, MonkeyGirlRuntime>; // 按 id 索引；静态设定在内容层

  flags: Record<string, boolean | number>; // 剧本/事件标记
  /** 收服前对话弹窗：赢得战斗 → 弹此弹窗 → 玩家读完 → confirmCapture → 写入收服结果。 */
  pendingCaptureDialogue?: {
    girlId: string;
    dialogue: DialogueLine[];
    battle: BattleState;
  } | null;
  flash?: { text: string; img?: string } | null; // 行动反馈 toast（瞬时 UI，加载时清空）
  pendingWhaleResult?: { text: string; img?: string } | null; // 鲸鱼事件结算结果（挽回单单等），在大弹窗里展示
  // 艾德对战中「精力快耗尽 → 吉奥雷送跑车救场」脚本弹窗。非空时 BattleScreen 上叠加救场弹窗，
  // 玩家确认即把当前对战强判为 WIN（习得 singHero）。详见 gameLoop.acceptRivalRescue。
  pendingRivalRescue?: { rivalId: string } | null;
  dayStartSnapshot?: GameState | null; // 当天开始时的快照，用于"重来这一天"
  mulasakeeComment?: { text: string; context: 'hub' | 'battle'; uid: number } | null; // Mulasakee 旁观弹窗（右上角，瞬时）
  eventLog: EventLogEntry[];
  pendingEvent?: GameEvent | null; // 待玩家响应的事件
  dayRestarted?: boolean; // 本天曾重来过，收工时跳过 flavor 事件
  battle?: BattleState | null; // 大秀进行中非空
  win: { conditions: WinConditionState; ended: boolean; result?: EndingType };
}
