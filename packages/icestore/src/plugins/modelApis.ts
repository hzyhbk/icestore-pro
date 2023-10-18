import * as T from '../types';

/**
 * ModelApis Plugin
 *
 * generates hooks for store
 */
export default ({ createElement }): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      // hooks
      function useModel(name) {
        const state = useModelState(name);
        const dispatchers = useModelDispatchers(name);
        return [state, dispatchers];
      }
      function useModelState(name) {
        const selector = store.useSelector(state => state[name]);
        if (typeof selector !== 'undefined') {
          return selector;
        }
        throw new Error(`Not found model by namespace: ${name}.`);
      }
      function useModelDispatchers(name) {
        const dispatch = store.useDispatch();
        if (dispatch[name]) {
          return dispatch[name];
        }
        throw new Error(`Not found model by namespace: ${name}.`);
      }
      function useModelEffectsLoading(name) {
        return store.useSelector(state =>
          state.loading ? state.loading.effects[name] : undefined,
        );
      }

      // other apis
      function getModel(name) {
        return [getModelState(name), getModelDispatchers(name)];
      }
      function getModelState(name) {
        return store.getState()[name];
      }
      function getModelDispatchers(name) {
        return store.dispatch[name];
      }

      // class component support
      function withModel(name, mapModelToProps?) {
        mapModelToProps = mapModelToProps || (model => ({ [name]: model }));
        return Component => {
          return props => {
            const value = useModel(name);
            const withProps = mapModelToProps(value);
            return createElement(Component, {
              ...withProps,
              ...props,
            });
          };
        };
      }

      return {
        // Hooks
        useModel,
        useModelState,
        useModelDispatchers,
        useModelEffectsLoading,

        // real time
        getModel,
        getModelState,
        getModelDispatchers,

        // Class component support
        withModel,
      };
    },
  };
};
