/**
 * 测试工厂：快速造 MonkeyGirlDef / GameState。仅测试引用，不进生产打包。
 */
import { createInitialGameState, type NewGameOptions } from '@/engine/initState';
import type { GameState, MonkeyGirlDef } from '@/types';

let girlSeq = 0;

export function makeGirl(overrides: Partial<MonkeyGirlDef> = {}): MonkeyGirlDef {
  const id = overrides.id ?? `girl_test_${++girlSeq}`;
  return {
    id,
    name: overrides.name ?? '测试猴女郎',
    type: overrides.type ?? '话术',
    tier: overrides.tier ?? 1,
    introHook: overrides.introHook ?? '',
    captureScript: overrides.captureScript ?? '',
    assets: overrides.assets ?? { scenes: [] },
    ...overrides,
  };
}

/** 造 GameState，并为传入的 girls 注册 unmet 运行时槽。可覆盖 resources/stats。 */
export function makeGame(
  opts: NewGameOptions & {
    girls?: MonkeyGirlDef[];
    resources?: Partial<GameState['resources']>;
    stats?: Partial<GameState['stats']>;
  } = {},
): GameState {
  const { girls = [], resources, stats, ...rest } = opts;
  const game = createInitialGameState({ seed: 1, girlIds: girls.map((g) => g.id), ...rest });
  if (resources) Object.assign(game.resources, resources);
  if (stats) Object.assign(game.stats, stats);
  return game;
}
