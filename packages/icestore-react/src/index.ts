import {
  createContext,
  createElement,
  ComponentType,
  ReactElement,
  Context,
} from 'react';
import {
  Provider as providerCpt,
  createSelectorHook,
  createDispatchHook,
} from 'react-redux';
import makeStoreCreator, {
  createModel,
  createComputor,
  Models,
  CreateStoreConfig,
  MapModelToProps,
  Optionalize,
  PresetIcestore,
  ExtractEffectConfig as EffectConfig,
} from 'icestore-pro';

export { createModel, createComputor, EffectConfig };

type WithModelReact<
  M extends Models = Models,
  F extends MapModelToProps<M> = MapModelToProps<M>,
> = {
  <K extends keyof M>(name: K, mapModelToProps?: F): <
    R extends ReturnType<F>,
    P extends R,
  >(
    Component: ComponentType<P>,
  ) => (props: Optionalize<P, R>) => ReactElement;
};

export const createStore: <M extends Models, C extends CreateStoreConfig<M>>(
  models: M,
  initConfig?: C,
) => PresetIcestore<M> & {
  widthModel: WithModelReact<M>;
  Provider: (props: { children: any; initialStates?: any }) => JSX.Element;
  context: Context<{ store: PresetIcestore<M> }>;
} = (models, initConfig) => {
  const context = createContext(null);
  return makeStoreCreator({
    context,
    createElement,
    providerCpt,
    createSelectorHook,
    createDispatchHook,
  })(models, initConfig) as any;
};
