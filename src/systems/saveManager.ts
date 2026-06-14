/**
 * 存档系统（design §8）：localStorage 单槽、每次状态变更 autosave、可重开。
 * M1 批2：补迁移链（§8.3）+ 损坏/不兼容档兜底（备份旧档、不白屏）+ 内容漂移校验（§8.4）。
 */
import { GIRLS_BY_ID } from '@/content/monkeyGirls.data';
import type { GameState } from '@/types';

const SAVE_KEY = 'lmclm.save.v1';
const BACKUP_KEY = 'lmclm.save.backup'; // 不兼容档保留原文，绝不静默丢
const SAVE_VERSION = 1;

interface SaveEnvelope {
  version: number;
  savedAt: string;
  state: GameState;
}

/** 单步迁移：version n → n+1。MVP 只有 v1，故为空（SAVE_VERSION===1 时永不进迁移循环）。 */
type Migration = (env: SaveEnvelope) => SaveEnvelope;
const MIGRATIONS: Record<number, Migration> = {
  // 1: (env) => ({ ...env, version: 2, state: addFieldXxx(env.state) }), // 示例占位
};

export function saveGame(state: GameState): void {
  try {
    const env: SaveEnvelope = {
      version: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(env));
  } catch (e) {
    // localStorage 可能超额/被禁用 —— 非阻塞，不崩游戏（design §8.2）
    console.warn('autosave 失败：', e);
  }
}

/** 结构 + 内容漂移校验（§8.3/§8.4）：顶层字段齐全、girls 引用的 id 都在内容层。 */
function validateState(s: unknown): s is GameState {
  if (!s || typeof s !== 'object') return false;
  const g = s as Partial<GameState>;
  if (
    typeof g.version !== 'number' ||
    !g.calendar ||
    !g.resources ||
    !g.capture ||
    !g.win ||
    !g.girls ||
    typeof g.girls !== 'object'
  ) {
    return false;
  }
  // 内容漂移：存档引用了内容层已不存在的 girl id（如 M2 删占位）→ 视为不兼容（§8.3 @OPEN）
  for (const id of Object.keys(g.girls)) {
    if (!GIRLS_BY_ID[id]) return false;
  }
  return true;
}

/** 不兼容/损坏档兜底：备份原文 + 清主槽，返回 null（当作无存档，走新周目，不白屏）。 */
function onIncompatibleSave(raw: string): null {
  try {
    localStorage.setItem(BACKUP_KEY, raw);
    localStorage.removeItem(SAVE_KEY);
    console.warn('存档版本不兼容/损坏，已备份到 lmclm.save.backup，可重开新周目。');
  } catch {
    /* 忽略 */
  }
  return null;
}

export function loadGame(): GameState | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let env: SaveEnvelope;
  try {
    env = JSON.parse(raw) as SaveEnvelope;
  } catch {
    return onIncompatibleSave(raw); // 损坏 JSON
  }
  if (!env || typeof env.version !== 'number') return onIncompatibleSave(raw);

  // 逐版迁移；缺迁移函数或迁移抛错 → 不兼容
  while (env.version < SAVE_VERSION) {
    const m = MIGRATIONS[env.version];
    if (!m) return onIncompatibleSave(raw);
    try {
      env = m(env);
    } catch {
      return onIncompatibleSave(raw);
    }
  }
  if (env.version > SAVE_VERSION) return onIncompatibleSave(raw); // 比代码还新

  return validateState(env.state) ? env.state : onIncompatibleSave(raw);
}

export function clearGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* 忽略 */
  }
}
