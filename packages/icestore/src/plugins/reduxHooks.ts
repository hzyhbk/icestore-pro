import * as T from '../types';
import shallowEqual from '../utils/shallowEqual';

interface ReduxHooksConfig {
  context: any;
  createSelectorHook: any;
  createDispatchHook: any;
}

/**
 * Redux Hooks Plugin
 *
 * generates redux hooks for store
 */
export default ({
  context,
  createSelectorHook,
  createDispatchHook,
}: ReduxHooksConfig): T.Plugin => {
  const baseUseSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);

  return {
    onStoreCreated() {
      return {
        // 性能优化：默认使用 shallowEqual
        useSelector(selector, equal = shallowEqual) {
          return baseUseSelector(selector, equal);
        },
        useDispatch,
      };
    },
  };
};
