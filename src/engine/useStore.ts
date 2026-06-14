import { useState, useEffect } from 'preact/hooks';
import type { Store } from './store';

/** 订阅 store，state 变更时重渲染。 */
export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState(store.getState());
  useEffect(() => store.subscribe(setState), [store]);
  return state;
}
