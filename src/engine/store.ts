/**
 * 极轻全局状态容器（design §2 / §3.1）。发布订阅，约 30 行，不引 Redux。
 */
export interface Store<T> {
  getState(): T;
  setState(next: T | ((prev: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<(state: T) => void>();

  return {
    getState: () => state,
    setState: (next) => {
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      for (const fn of listeners) fn(state);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
