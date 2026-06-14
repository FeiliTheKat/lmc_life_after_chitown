/**
 * 启动装配：建 store + controller，接 autosave，提供重开。
 * M1 起用完整 30 天赛季（balance.calendar.totalDays）。
 */
import { createStore } from './store';
import { createGameController } from './gameLoop';
import { createInitialGameState } from './initState';
import { saveGame, loadGame, clearGame } from '@/systems/saveManager';
import { assertContentInvariants } from '@/systems/contentInvariants';
import { ALL_GIRL_IDS } from '@/content/monkeyGirls.data';
import type { GameState } from '@/types';

assertContentInvariants(); // 启动期内容自检（design §8.4）：作者数据出错即时暴露

function freshGame(): GameState {
  return createInitialGameState({ girlIds: ALL_GIRL_IDS }); // totalDays 默认取 balance(30)
}

const loaded = loadGame();
if (loaded) loaded.flash = null; // 瞬时 toast 不跨刷新
export const store = createStore<GameState>(loaded ?? freshGame());
export const controller = createGameController(store);

// 每次状态变更 autosave（design §8.2：行动/进天/事件后存）
store.subscribe(saveGame);

export function resetGame(): void {
  clearGame();
  store.setState(freshGame());
}
