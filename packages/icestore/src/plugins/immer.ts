import produce, { enableES5 } from 'immer';
import { combineReducers, ReducersMapObject } from 'redux';
import * as T from '../types';

// make it work in IE11
enableES5();

export interface ImmerConfig {
  blacklist?: string[];
}

function createCombineReducersWithImmer(blacklist: string[] = []) {
  return function (reducers: ReducersMapObject, models: any) {
    const reducersWithImmer: ReducersMapObject<any, T.Action<any>> = {};
    // reducer must return value because literal don't support immer
    const initComputed: Record<string, boolean> = {};
    Object.keys(reducers).forEach(key => {
      const reducerFn = reducers[key];
      initComputed[key] = false;

      reducersWithImmer[key] = (state, payload) => {
        const nextState =
          typeof state === 'object' && !blacklist.includes(key)
            ? produce(state, (draft: T.Models) => {
                const next = reducerFn(draft, payload);
                if (typeof next === 'object') return next;
              })
            : reducerFn(state, payload);
        // 初始计算过

        if (
          (!initComputed[key] ||
            (initComputed[key] && payload.type.startsWith(`${key}/`))) &&
          models[key] &&
          models[key].computed
        ) {
          return produce(nextState, draft => {
            for (const computedKey in models[key].computed) {
              // TODO 没返回咋办
              draft[computedKey] = models[key].computed[computedKey](draft);
            }
          });
        }

        return nextState;
      };
    });

    return combineReducers(reducersWithImmer);
  };
}

// icestore plugin
const immerPlugin = (config: ImmerConfig = {}): T.Plugin => ({
  config: {
    redux: {
      combineReducers: createCombineReducersWithImmer(config.blacklist) as any,
    },
  },
});

export default immerPlugin;
