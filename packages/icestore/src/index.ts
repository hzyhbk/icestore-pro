import thunkMiddleware from 'redux-thunk';
import Icestore from './icestore';
import * as T from './types';
import mergeConfig from './utils/mergeConfig';
import createProviderPlugin from './plugins/provider';
import createReduxHooksPlugin from './plugins/reduxHooks';
import createModelApisPlugin from './plugins/modelApis';
import createImmerPlugin from './plugins/immer';
import createLoadingPlugin from './plugins/loading';
import appendReducers from './utils/appendReducers';
import { createSelector as createComputor } from 'reselect';

// incrementer used to provide a store name if none exists
let count = 0;

/**
 * createOriginStore
 *
 * generates a Icestore with a set configuration
 * @param config
 */
const init = <M extends T.Models>(
  initConfig: T.InitConfig<M> = {},
): T.Icestore<M> => {
  const name = initConfig.name || count.toString();
  count += 1;
  const config: T.Config = mergeConfig({ ...initConfig, name });
  return new Icestore(config).init();
};

/**
 * createStore
 *
 * generates a preset Icestore
 * @param models
 * @param initConfig
 */
const makeStoreCreator =
  ({
    context,
    createElement,
    providerCpt,
    createSelectorHook,
    createDispatchHook,
  }: any) =>
  <M extends T.Models, C extends T.CreateStoreConfig<M>>(
    models: M,
    initConfig?: C,
  ): T.PresetIcestore<M> => {
    const {
      disableImmer,
      disableLoading,
      plugins = [],
      redux = {},
    } = initConfig || {};
    const middlewares = redux.middlewares || [];

    // const context = React.createContext(null);

    // defaults middlewares
    middlewares.push(thunkMiddleware);

    // defaults plugins
    plugins.push(createProviderPlugin({ context, createElement, providerCpt }));
    plugins.push(
      createReduxHooksPlugin({
        context,
        createSelectorHook,
        createDispatchHook,
      }),
    );
    plugins.push(createModelApisPlugin({ createElement }));

    // https://github.com/ice-lab/icestore/issues/94
    // TODO: fix error & loading plugin immer problem
    const immerBlacklist = [];
    if (!disableLoading) {
      plugins.push(createLoadingPlugin());
      immerBlacklist.push('loading');
    }
    if (!disableImmer) {
      plugins.push(createImmerPlugin({ blacklist: immerBlacklist }));
    }

    // compatibility handling
    const wrappedModels = appendReducers(models);

    const store = init({
      models: wrappedModels,
      plugins,
      redux: {
        ...redux,
        middlewares,
      },
    });

    return store as T.PresetIcestore<M>;
  };

export default makeStoreCreator;
export { createComputor };
export * from './types';
