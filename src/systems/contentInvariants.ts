/**
 * 启动期内容自检（design §8.4）：把"作者填错数据"在启动就暴露，而不是玩到一半崩。
 * dev 抛错（红屏即见）、prod 记 console.error 降级（不崩游戏）。纯函数，零副作用。
 *
 * 校验：必需 10 + 隐藏 1；tier 合法；鲸鱼不进 churn 池；resist 键合法；
 *       churn 事件至少一个 outcome 无 churnGirlId（§7.4 公平性兜底）。
 */
import { MONKEY_GIRLS } from '@/content/monkeyGirls.data';
import { ALL_EVENTS } from '@/content/events.data';
import { MONKEY_PORTRAITS } from '@/content/monkey.data';
import { pic } from '@/content/assets';
import type { MoveCategory } from '@/types';

const VALID_CATEGORIES: ReadonlySet<MoveCategory> = new Set(['金钱', '话术', '才艺', '颜值']);

/** 收集所有不变量违例（空数组 = 全部通过）。 */
export function checkContentInvariants(): string[] {
  const errs: string[] = [];

  // 1) 必需 10（非隐藏）+ 隐藏恰 1（PRD 1.10① / §7.5）
  const required = MONKEY_GIRLS.filter((g) => g.isHidden !== true);
  const hidden = MONKEY_GIRLS.filter((g) => g.isHidden === true);
  if (required.length !== 10) errs.push(`必需猴女郎应为 10 个，实际 ${required.length}`);
  if (hidden.length !== 1) errs.push(`隐藏第 11 应恰 1 个，实际 ${hidden.length}`);

  // 2) 每个 girl：tier 合法、鲸鱼不进 churn 池、resist 键合法（§7.3 / §5.3）
  for (const g of MONKEY_GIRLS) {
    if (![1, 2, 3, 4].includes(g.tier)) errs.push(`${g.id} tier 非法：${g.tier}`);
    if (g.isWhale && g.inChurnPool === true) {
      errs.push(`${g.id} 是鲸鱼，不得进常规流失池（inChurnPool 须非 true）`);
    }
    for (const k of Object.keys(g.resist ?? {})) {
      if (!VALID_CATEGORIES.has(k as MoveCategory)) errs.push(`${g.id} resist 含非法键：${k}`);
    }
  }

  // 3) 每个 churn 事件至少一个 outcome 无 churnGirlId（§7.4：任何时刻有一条不流失的路）
  for (const e of ALL_EVENTS) {
    if (e.kind !== 'churn') continue;
    const hasSafe = (e.choices ?? []).some((c) => !c.outcome.churnGirlId);
    if (!hasSafe) errs.push(`churn 事件 ${e.id} 缺少安全选项（每个 churn 至少一个不流失的 outcome）`);
  }

  // 4) 所有引用的图都能在 /pweb 解析（防断链：少图/改名/拼错在启动即暴露）
  const assertPic = (file: string | undefined, where: string) => {
    if (file && pic(file) === undefined) errs.push(`${where} 引用了不存在的图：${file}`);
  };
  for (const g of MONKEY_GIRLS) {
    for (const s of g.assets.scenes) assertPic(s.src, `${g.id} 场景[${s.key}]`);
  }
  for (const srcs of Object.values(MONKEY_PORTRAITS)) {
    for (const src of srcs) assertPic(src, '小猴猫立绘');
  }
  for (const e of ALL_EVENTS) {
    assertPic(e.image, `事件 ${e.id} 插图`);
    for (const c of e.choices ?? []) assertPic(c.outcome.img, `事件 ${e.id} 结果图`);
  }

  return errs;
}

/** 启动时调用：dev 抛错，prod 降级记日志。 */
export function assertContentInvariants(): void {
  const errs = checkContentInvariants();
  if (errs.length === 0) return;
  const msg = `内容自检失败（design §8.4）：\n- ${errs.join('\n- ')}`;
  if (import.meta.env.DEV) throw new Error(msg);
  console.error(msg);
}
