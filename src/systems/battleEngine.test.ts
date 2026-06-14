import { describe, it, expect } from 'vitest';
import {
  canUseMove,
  enterBattle,
  resolveTurn,
  resistCoef,
  movePower,
  applyBattleResult,
} from './battleEngine';
import { MOVES } from '@/content/moves.data';
import { balance } from '@/config/balance.config';
import { makeGirl, makeGame } from '@/test/factories';

describe('enterBattle 对话流种子', () => {
  it('有 introDialogue → 用之；无则用 introHook 旁白兜底', () => {
    const withIntro = makeGirl({ introDialogue: [{ who: 'girl', text: '你好' }] });
    expect(enterBattle(makeGame({ girls: [withIntro] }), withIntro).dialogue).toEqual([
      { who: 'girl', text: '你好' },
    ]);
    const noIntro = makeGirl({ introHook: '她在直播' });
    expect(enterBattle(makeGame({ girls: [noIntro] }), noIntro).dialogue).toEqual([
      { who: 'narration', text: '她在直播' },
    ]);
  });
});

describe('canUseMove 守卫（§5.2.1）', () => {
  it('精力恰好等于成本可出招（用 >=）', () => {
    const game = makeGame({ resources: { energy: MOVES.rhetoric.costEnergy } });
    expect(canUseMove(MOVES.rhetoric, game)).toBe(true);
  });

  it('精力不足不可出招', () => {
    const game = makeGame({ resources: { energy: MOVES.rhetoric.costEnergy - 1 } });
    expect(canUseMove(MOVES.rhetoric, game)).toBe(false);
  });

  it('金钱不足时金钱攻略禁用', () => {
    const game = makeGame({ resources: { money: 0 } });
    expect(canUseMove(MOVES.money, game)).toBe(false);
  });

  it('守卫未过 → resolveTurn 原样返回、state 不变', () => {
    const girl = makeGirl({ type: '金钱' });
    const game = makeGame({ girls: [girl], resources: { money: 0 } });
    const battle = enterBattle(game, girl);
    const res = resolveTurn(battle, game, girl, 'money');
    expect(res.changed).toBe(false);
    expect(res.game).toBe(game);
  });
});

describe('movePower / resistCoef（§5.2-5.3）', () => {
  it('话术强度 = 话术等级 × 2', () => {
    const game = makeGame({ stats: { rhetoricLvl: 10 } });
    expect(movePower(MOVES.rhetoric, game)).toBe(20);
  });

  it('对口 2.0 / 不对口 0.5 / 混合两口 1.0', () => {
    const talkGirl = makeGirl({ type: '话术' });
    expect(resistCoef(talkGirl, '话术')).toBe(2.0);
    expect(resistCoef(talkGirl, '才艺')).toBe(0.5);
    const mixGirl = makeGirl({ type: '混合', resist: { 颜值: 1.0, 才艺: 1.0 } });
    expect(resistCoef(mixGirl, '颜值')).toBe(1.0);
    expect(resistCoef(mixGirl, '话术')).toBe(0.5);
  });
});

describe('单回合时序（§5.2.1）', () => {
  it('攻陷优先于反击：一击攻陷即 WIN，反击不扣精力', () => {
    const girl = makeGirl({ type: '话术', tier: 1 }); // threshold 100
    const game = makeGame({ girls: [girl], stats: { rhetoricLvl: 25 } }); // 25×2×2.0=100
    const battle = enterBattle(game, girl);
    const res = resolveTurn(battle, game, girl, 'rhetoric');
    expect(res.battle.result).toBe('win');
    expect(res.battle.captureProgress).toBe(100);
    // 仅扣出招成本，未被反击扣
    expect(res.game.resources.energy).toBe(100 - MOVES.rhetoric.costEnergy);
  });

  it('精力恰好够最后一击且攻陷 → WIN（非 LOSE）', () => {
    const girl = makeGirl({ type: '话术', tier: 1 });
    const game = makeGame({
      girls: [girl],
      stats: { rhetoricLvl: 25 },
      resources: { energy: MOVES.rhetoric.costEnergy }, // 出招后精力 0
    });
    const res = resolveTurn(enterBattle(game, girl), game, girl, 'rhetoric');
    expect(res.battle.result).toBe('win');
    expect(res.game.resources.energy).toBe(0);
  });

  it('精力够出招但攻陷不足 → 反击后 LOSE', () => {
    const girl = makeGirl({ type: '话术', tier: 1 });
    const game = makeGame({
      girls: [girl],
      stats: { rhetoricLvl: 10 }, // 仅 40 攻陷，不够 100
      resources: { energy: MOVES.rhetoric.costEnergy },
    });
    const res = resolveTurn(enterBattle(game, girl), game, girl, 'rhetoric');
    expect(res.battle.result).toBe('lose');
    expect(res.game.resources.energy).toBe(0);
  });

  it('noFail 型：精力见底也不判负，战斗继续', () => {
    const girl = makeGirl({ type: '话术', tier: 1, noFail: true });
    const game = makeGame({
      girls: [girl],
      stats: { rhetoricLvl: 10 },
      resources: { energy: MOVES.rhetoric.costEnergy },
    });
    const res = resolveTurn(enterBattle(game, girl), game, girl, 'rhetoric');
    expect(res.battle.result).toBeUndefined();
    expect(res.battle.turn).toBe(2);
    expect(res.game.resources.energy).toBe(0);
  });
});

describe('重复衰减按 category 共享（§5.3）', () => {
  it('唱歌后跳抓钱舞：第二击吃 0.6^1（同属才艺 streak）', () => {
    const girl = makeGirl({ type: '才艺', tier: 1 }); // 才艺对口 2.0
    const game = makeGame({ girls: [girl], stats: { talentLvl: 5 } }); // power 10
    let r = resolveTurn(enterBattle(game, girl), game, girl, 'singHero');
    expect(r.battle.captureProgress).toBe(20); // 10×2×1
    r = resolveTurn(r.battle, r.game, girl, 'cashDance');
    // 共享才艺 streak=2 → decay 0.6：10×2×0.6=12（若误重置则会是 20）
    expect(r.battle.log.at(-1)!.delta).toBe(12);
    expect(r.battle.captureProgress).toBe(32);
  });
});

describe('感化暴击仅唱《英雄》（§5.5）', () => {
  it('放敌人歌时 singHero ×2、cashDance 不暴击', () => {
    const girl = makeGirl({ type: '才艺', tier: 1, playsEnemySong: true });
    const game = makeGame({ girls: [girl], stats: { talentLvl: 5 } });
    const sing = resolveTurn(enterBattle(game, girl), game, girl, 'singHero');
    expect(sing.battle.captureProgress).toBe(40); // 10×2×1×2
    const dance = resolveTurn(enterBattle(game, girl), game, girl, 'cashDance');
    expect(dance.battle.captureProgress).toBe(20); // 10×2×1×1
  });
});

describe('才艺限定·用错才艺致败（§5.5）', () => {
  it('requiredTalent=singHero 时跳抓钱舞 → 立即 LOSE，不扣资源', () => {
    const girl = makeGirl({ type: '才艺', tier: 1, requiredTalent: 'singHero' });
    const game = makeGame({ girls: [girl], stats: { talentLvl: 5 } });
    const res = resolveTurn(enterBattle(game, girl), game, girl, 'cashDance');
    expect(res.battle.result).toBe('lose');
    expect(res.battle.captureProgress).toBe(0);
    expect(res.game.resources.energy).toBe(100); // 未扣成本
  });

  it('用对的才艺（singHero）不判负', () => {
    const girl = makeGirl({ type: '才艺', tier: 1, requiredTalent: 'singHero' });
    const game = makeGame({ girls: [girl], stats: { talentLvl: 5 } });
    const res = resolveTurn(enterBattle(game, girl), game, girl, 'singHero');
    expect(res.battle.result).toBeUndefined();
  });
});

describe('颜值反问 / 开窗（§5.4）', () => {
  it('颜控达标开窗，颜值反问命中 +50 且幂等', () => {
    const girl = makeGirl({ type: '颜控', tier: 1, captureThreshold: 300 }); // 提高阈值避免一击
    const game = makeGame({ girls: [girl], stats: { looksBase: 70 } });
    const battle = enterBattle(game, girl);
    expect(battle.complimentOpen).toBe(true);

    let r = resolveTurn(battle, game, girl, 'looks');
    // 70×0.6×2.0=84 +50 bonus = 134
    expect(r.battle.captureProgress).toBe(134);
    expect(r.battle.loveAtFirstSightApplied).toBe(true);
    expect(r.battle.complimentOpen).toBe(false);
    expect(r.battle.revealedThisBattle).toContain('颜值');

    // 第二次 looks：无 bonus，仅衰减后普通攻略（84×0.6=50.4→50）
    r = resolveTurn(r.battle, r.game, girl, 'looks');
    expect(r.battle.log.at(-1)!.delta).toBe(50);
  });

  it('非颜控不开窗', () => {
    const girl = makeGirl({ type: '话术', tier: 1 });
    const game = makeGame({ girls: [girl] });
    expect(enterBattle(game, girl).complimentOpen).toBe(false);
  });
});

describe('喜好半隐藏显形（§5.7）', () => {
  it('混合两口（coef 1.0>0.5）显形，不对口（0.5）不显形', () => {
    const girl = makeGirl({ type: '混合', tier: 1, resist: { 颜值: 1.0, 才艺: 1.0 } });
    const game = makeGame({ girls: [girl] });
    let r = resolveTurn(enterBattle(game, girl), game, girl, 'looks'); // 颜值 coef1.0
    expect(r.battle.revealedThisBattle).toContain('颜值');
    r = resolveTurn(r.battle, r.game, girl, 'rhetoric'); // 话术 coef0.5
    expect(r.battle.revealedThisBattle).not.toContain('话术');
  });
});

describe('战斗结算 applyBattleResult（§5.6）', () => {
  it('WIN：收服计数+1、状态 signed、粉丝/打赏/话术增益', () => {
    const girl = makeGirl({ tier: 1 });
    const game = makeGame({ girls: [girl] });
    const battle = enterBattle(game, girl);
    battle.result = 'win';
    const after = applyBattleResult(game, battle, girl);
    expect(after.capture.signedCount).toBe(1);
    expect(after.girls[girl.id].status).toBe('signed');
    expect(after.resources.fans).toBe(balance.resources.fansStart + balance.battle.winFans);
    expect(after.resources.money).toBe(balance.battle.winTip);
    expect(after.stats.rhetoricLvl).toBe(balance.stats.rhetoricStart + balance.battle.winRhetoric);
    expect(after.battle).toBeNull();
  });

  it('LOSE：掉粉、话术+3（越战越强）、attempts+1、显形写回', () => {
    const girl = makeGirl({ tier: 1 });
    const game = makeGame({ girls: [girl] });
    const battle = enterBattle(game, girl);
    battle.result = 'lose';
    battle.revealedThisBattle = ['话术'];
    const after = applyBattleResult(game, battle, girl);
    expect(after.resources.fans).toBe(balance.resources.fansStart + balance.battle.loseFans);
    expect(after.stats.rhetoricLvl).toBe(balance.stats.rhetoricStart + balance.battle.loseRhetoric);
    expect(after.girls[girl.id].attempts).toBe(1);
    expect(after.girls[girl.id].revealedWeakness).toContain('话术');
  });
});
