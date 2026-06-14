/**
 * 大秀 PK 战斗引擎（design §5）。全部纯函数：输入 (battle, game, girl, moveKey)，
 * 输出新 state + 本回合日志。所有数字取自 balance.config（§6）。
 *
 * 关键时序（§5.2.1）：攻陷优先于反击——本回合若攻陷≥阈值立即 WIN、反击不发生；
 * 精力=0 的 LOSE 只由反击触发；noFail 型跳过 LOSE 分支。
 */
import { balance } from '@/config/balance.config';
import { MOVES } from '@/content/moves.data';
import { clampResources } from '@/systems/economy';
import type {
  BattleState,
  GameState,
  MonkeyGirlDef,
  MoveCategory,
  MoveDef,
  MoveKey,
  SceneKey,
} from '@/types';

const TYPE_TO_CATEGORY: Record<MonkeyGirlDef['type'], MoveCategory | null> = {
  颜控: '颜值',
  话术: '话术',
  才艺: '才艺',
  金钱: '金钱',
  混合: null, // 混合型须在 def.resist 显式声明其两口（如单单 {颜值:1,才艺:1}）
};

export interface TurnResult {
  battle: BattleState;
  game: GameState;
  /** false = 守卫未过（精力/金钱不足），state 原样返回 */
  changed: boolean;
}

// ───────────────────────── 取值 helper（导出供测试） ─────────────────────────

export function effectiveLooks(game: GameState): number {
  return game.stats.asenStyle ? balance.asenStyle.looksTo : game.stats.looksBase;
}

/** 攻略基础强度（§5.2 step2） */
export function movePower(move: MoveDef, game: GameState): number {
  switch (move.category) {
    case '话术':
      return game.stats.rhetoricLvl * balance.rhetoricMul;
    case '才艺':
      return game.stats.talentLvl * balance.talentMul;
    case '金钱':
      return ((move.costMoneyPerUse ?? 0) / 100) * balance.moneyMul;
    case '颜值':
      return effectiveLooks(game) * balance.looksMul;
  }
}

/** 类型克制系数（§5.2 step3 / §5.3） */
export function resistCoef(girl: MonkeyGirlDef, cat: MoveCategory): number {
  const override = girl.resist?.[cat];
  if (override !== undefined) return override;
  const onCat = TYPE_TO_CATEGORY[girl.type];
  if (onCat) return cat === onCat ? balance.coefOnType : balance.coefOffType;
  // 混合型未填 resist：保守按不对口（内容应显式填 resist）
  return balance.coefOffType;
}

/** 个人颜控阈值（§5.4） */
export function looksGateFor(girl: MonkeyGirlDef): number {
  return girl.looksGate ?? balance.loveLooksGate;
}

/** 出招可用性守卫（§5.2 前置）：精力够本次出招；金钱攻略金钱不足则禁用 */
export function canUseMove(move: MoveDef, game: GameState): boolean {
  if (game.resources.energy < move.costEnergy) return false;
  if (move.costMoneyPerUse && game.resources.money < move.costMoneyPerUse) return false;
  return true;
}

// ───────────────────────── 进入战斗 ─────────────────────────

export function enterBattle(game: GameState, girl: MonkeyGirlDef): BattleState {
  const battle: BattleState = {
    girlId: girl.id,
    threshold: girl.captureThreshold ?? balance.threshold[girl.tier],
    captureProgress: 0,
    energyAtStart: game.resources.energy,
    turn: 1,
    categoryStreak: { 金钱: 0, 话术: 0, 才艺: 0, 颜值: 0 },
    lastCategory: undefined,
    loveAtFirstSightApplied: false,
    complimentOpen: false,
    revealedThisBattle: [],
    display: { monkeyScene: 'idle', girlScene: 'idle' },
    log: [],
    dialogue: girl.introDialogue ?? (girl.introHook ? [{ who: 'narration', text: girl.introHook }] : []),
    moveUses: {},
  };
  // 颜控开窗（§5.4）：颜值达个人阈值 → 她夸你帅，可接颜值反问
  if (girl.type === '颜控' && effectiveLooks(game) >= looksGateFor(girl)) {
    battle.complimentOpen = true;
  }
  return battle;
}

// ───────────────────────── 单回合结算 ─────────────────────────

function maybeReveal(battle: BattleState, cat: MoveCategory, coef: number): void {
  if (coef > balance.revealSoftGate && !battle.revealedThisBattle.includes(cat)) {
    battle.revealedThisBattle.push(cat);
  }
}

function pickScenes(result: 'win' | 'lose' | 'turn'): { monkeyScene: SceneKey; girlScene: SceneKey } {
  if (result === 'win') return { monkeyScene: 'won', girlScene: 'won' };
  if (result === 'lose') return { monkeyScene: 'lost', girlScene: 'lost' };
  return { monkeyScene: 'reacting', girlScene: 'reacting' };
}

export function resolveTurn(
  prevBattle: BattleState,
  prevGame: GameState,
  girl: MonkeyGirlDef,
  moveKey: MoveKey,
): TurnResult {
  const move = MOVES[moveKey];

  // 0) 前置守卫（§5.2.1-4：用 >=，精力恰好够也能出）。不满足 → 原样返回。
  if (!canUseMove(move, prevGame)) {
    return { battle: prevBattle, game: prevGame, changed: false };
  }

  const battle = structuredClone(prevBattle);
  const game = structuredClone(prevGame);
  const cat = move.category;
  const currentTurn = battle.turn;

  // 才艺限定·用错才艺致败（§5.5）：她要唱歌你跳舞 → 当场翻车
  if (cat === '才艺' && girl.requiredTalent && moveKey !== girl.requiredTalent) {
    battle.result = 'lose';
    battle.display = pickScenes('lose');
    battle.log.push({ turn: currentTurn, text: `用错了才艺（她要的是另一手）`, delta: 0 });
    return { battle, game, changed: true };
  }

  // 1) 成本扣除（钳制下限 0，绝不为负）
  game.resources.energy -= move.costEnergy;
  if (move.costMoneyPerUse) game.resources.money -= move.costMoneyPerUse;
  clampResources(game.resources);

  // 2-3) 强度 × 克制
  const power = movePower(move, game);
  const coef = resistCoef(girl, cat);

  // 4) 重复衰减（按 category；换类别该项完全恢复，§5.3 (i)）
  if (cat === battle.lastCategory) {
    battle.categoryStreak[cat] += 1;
  } else {
    battle.categoryStreak[cat] = 1;
  }
  const decay = balance.decayBase ** (battle.categoryStreak[cat] - 1);
  battle.lastCategory = cat;

  // 5) 感化暴击（放敌人歌 & 唱《英雄》，§5.5）
  const enlighten = girl.playsEnemySong && move.canEnlighten ? balance.enlightenMul : 1.0;

  // 6) 本回合攻陷增量
  let gain = Math.round(power * coef * decay * enlighten);

  // 颜值反问命中（§5.4）：开窗期间出颜值 → 额外 +bonus，消费开窗、显形颜值
  if (moveKey === 'looks' && battle.complimentOpen && !battle.loveAtFirstSightApplied) {
    gain += balance.loveAtFirstSightBonus;
    battle.loveAtFirstSightApplied = true;
    battle.complimentOpen = false;
    if (!battle.revealedThisBattle.includes('颜值')) battle.revealedThisBattle.push('颜值');
  }

  battle.captureProgress += gain;

  // 7) 喜好显形（半隐藏，§5.7）
  maybeReveal(battle, cat, coef);

  // 8) WIN 优先于反击（§5.2.1-1）
  if (battle.captureProgress >= battle.threshold) {
    battle.result = 'win';
    battle.display = pickScenes('win');
    battle.log.push({ turn: currentTurn, text: `${move.label} 命中，收服！`, delta: gain });
    return { battle, game, changed: true };
  }

  // 9) 猴女郎反击（仅未攻陷时）
  const counter = girl.counterPower ?? balance.counter[girl.tier];
  game.resources.energy -= counter;
  clampResources(game.resources);

  // 10) 更新双截图 + 日志
  battle.display = pickScenes('turn');
  battle.log.push({ turn: currentTurn, text: `${move.label}（+${gain}）`, delta: gain });

  // 11) 失败判定（反击后精力见底；noFail 跳过，§5.4）
  if (!girl.noFail && game.resources.energy <= 0) {
    battle.result = 'lose';
    battle.display = pickScenes('lose');
    return { battle, game, changed: true };
  }

  battle.turn += 1;
  return { battle, game, changed: true };
}

// ───────────────────────── 战斗结算（§5.6） ─────────────────────────

/** 把战斗结果写回 GameState：收服/逃脱的资源、属性、图鉴、越战越强。 */
export function applyBattleResult(
  prevGame: GameState,
  battle: BattleState,
  girl: MonkeyGirlDef,
): GameState {
  const game = structuredClone(prevGame);
  const rt = game.girls[girl.id];

  if (battle.result === 'win') {
    rt.status = 'signed';
    rt.daysSinceSigned = 0;
    if (girl.isHidden) {
      // 赢下神秘嘉宾（Mulasakee）≠收服：不计收服数、不进后宫产出（passivePayout 同守 isHidden），
      // 仅置旗供结局彩蛋（EndingScreen 在 WIN 时据此追加 ASEN《永玄大典》隐藏动态）。
      game.flags.sakeeBeaten = true;
    } else {
      game.capture.signedCount += 1;
    }
    game.resources.fans += balance.battle.winFans;
    game.resources.money += balance.battle.winTip;
    game.stats.rhetoricLvl += balance.battle.winRhetoric;
  } else if (battle.result === 'lose') {
    game.resources.fans += balance.battle.loseFans; // loseFans 为负
    game.stats.rhetoricLvl += balance.battle.loseRhetoric; // 越战越强：失败 +3 话术
    rt.attempts += 1;
    // 试出的喜好保留到下次重试（§5.6）
    for (const c of battle.revealedThisBattle) {
      if (!rt.revealedWeakness.includes(c)) rt.revealedWeakness.push(c);
    }
  }

  clampResources(game.resources);
  game.battle = null;
  return game;
}
