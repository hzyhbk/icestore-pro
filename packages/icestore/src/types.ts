import * as Redux from 'redux';

export type Optionalize<T extends K, K> = Omit<T, keyof K>;
type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];
type EffectState = {
  isLoading: boolean;
  error: Error;
};
type EffectsState<Effects> = {
  [K in keyof Effects]: EffectState;
};
type EffectsLoading<Effects> = {
  [K in keyof Effects]: boolean;
};
type EffectsError<Effects> = {
  [K in keyof Effects]: {
    error: Error;
    value: number;
  };
};
export type ExtractIcestoreStateFromModels<M extends Models> = {
  [modelKey in keyof M]: ExtractIModelStateFromModelConfig<M[modelKey]>;
};
export type IcestoreRootState<M extends Models> =
  ExtractIcestoreStateFromModels<M>;

type ExtractIModelDispatcherAsyncFromEffect<E> = E extends () => Promise<
  infer R
>
  ? IcestoreDispatcherAsync<void, void, R>
  : E extends (payload: infer P) => Promise<infer R>
  ? IcestoreDispatcherAsync<P, void, R>
  : E extends (payload: infer P, rootState: any) => Promise<infer R>
  ? IcestoreDispatcherAsync<P, void, R>
  : E extends (
      payload: infer P,
      rootState: any,
      meta: infer M,
    ) => Promise<infer R>
  ? IcestoreDispatcherAsync<P, M, R>
  : IcestoreDispatcherAsync<any, any, any>;
export type ExtractIModelDispatchersFromEffectsObject<
  effects extends ModelEffects<any>,
> = {
  [effectKey in keyof effects]: ExtractIModelDispatcherAsyncFromEffect<
    effects[effectKey]
  >;
};
export type ExtractIModelDispatchersFromEffects<
  effects extends ModelConfig['effects'],
> = ExtractIModelDispatchersFromEffectsObject<effects & {}>;

type ExtractIModelDispatcherFromReducer<R> = R extends () => any
  ? IcestoreDispatcher<void, void>
  : R extends (state: infer S) => infer S | void
  ? IcestoreDispatcher<void, void>
  : R extends (state: infer S, payload: infer P) => infer S | void
  ? IcestoreDispatcher<P, void>
  : R extends (
      state: infer S,
      payload: infer P,
      meta: infer M,
    ) => infer S | void
  ? IcestoreDispatcher<P, M>
  : IcestoreDispatcher<any, any>;

type DefaultIModelDispatchersFromReducersObject = {
  setState: IcestoreDispatcher<any, any>;
};
export type ExtractIModelDispatchersFromReducersObject<
  reducers extends ModelReducers<any>,
> = {
  [reducerKey in keyof reducers]: ExtractIModelDispatcherFromReducer<
    reducers[reducerKey]
  >;
} & DefaultIModelDispatchersFromReducersObject;

export type ExtractIModelDispatchersFromReducers<
  reducers extends ModelConfig['reducers'],
> = ExtractIModelDispatchersFromReducersObject<reducers & {}>;

type ExtractComputed<C extends ModelComputed> = {
  [K in keyof C]: ReturnType<C[K]>;
};

export type ExtractIModelStateFromModelConfig<M extends ModelConfig> = PropType<
  M,
  'state'
> &
  ExtractComputed<PropType<M, 'computed'>>;
export type ExtractIModelEffectsFromModelConfig<M extends ModelConfig> =
  PropType<M, 'effects'>;
export type ExtractIModelReducersFromModelConfig<M extends ModelConfig> =
  PropType<M, 'reducers'>;
export type ExtractIModelFromModelConfig<M extends ModelConfig> = [
  ExtractIModelStateFromModelConfig<M>,
  ExtractIModelDispatchersFromModelConfig<M>,
];
export type ExtractIModelEffectsErrorFromModelConfig<M extends ModelConfig> =
  EffectsError<
    ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>
  >;
export type ExtractIModelEffectsLoadingFromModelConfig<M extends ModelConfig> =
  EffectsLoading<
    ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>
  >;
export type ExtractIModelEffectsStateFromModelConfig<M extends ModelConfig> =
  EffectsState<
    ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>
  >;

export type ExtractIModelDispatchersFromModelConfig<M extends ModelConfig> =
  ExtractIModelDispatchersFromReducers<
    ExtractIModelReducersFromModelConfig<M>
  > &
    ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>;

export type ExtractIcestoreDispatchersFromModels<M extends Models> = {
  [modelKey in keyof M]: ExtractIModelDispatchersFromModelConfig<M[modelKey]>;
};
type IcestoreDispatcher<P = void, M = void> = ([P] extends [void]
  ? (...args: any[]) => Action<any, any>
  : [M] extends [void]
  ? (payload: P) => Action<P, void>
  : (payload: P, meta: M) => Action<P, M>) &
  ((action: Action<P, M>) => Redux.Dispatch<Action<P, M>>) &
  ((action: Action<P, void>) => Redux.Dispatch<Action<P, void>>);
type IcestoreDispatcherAsync<P = void, M = void, R = void> = ([P] extends [void]
  ? (...args: any[]) => Promise<R>
  : [M] extends [void]
  ? (payload: P) => Promise<R>
  : (payload: P, meta: M) => Promise<R>) &
  ((action: Action<P, M>) => Promise<R>) &
  ((action: Action<P, void>) => Promise<R>);

export type IcestoreDispatch<M extends Models | void = void> = (M extends Models
  ? ExtractIcestoreDispatchersFromModels<M>
  : {
      [key: string]: {
        [key: string]: IcestoreDispatcher | IcestoreDispatcherAsync;
      };
    }) &
  (IcestoreDispatcher | IcestoreDispatcherAsync) &
  Redux.Dispatch<any>;
export interface Icestore<M extends Models = Models, A extends Action = Action>
  extends Redux.Store<IcestoreRootState<M>, A> {
  name: string;
  replaceReducer(nextReducer: Redux.Reducer<IcestoreRootState<M>, A>): void;
  dispatch: IcestoreDispatch<M>;
  getState(): IcestoreRootState<M>;
  model(model: Model): void;
  subscribe(listener: () => void): Redux.Unsubscribe;
}

type UseModel<M extends Models = Models, Key extends keyof M = undefined> = {
  <K extends keyof M>(name: K): ExtractIModelFromModelConfig<
    Key extends undefined ? M[K] : M[Key]
  >;
};
export type MapModelToProps<
  M extends Models = Models,
  Key extends keyof M = undefined,
> = {
  <K extends keyof M>(
    model: ExtractIModelFromModelConfig<Key extends undefined ? M[K] : M[Key]>,
  ): Record<string, any>;
};

type ModelValueAPI<M extends Models = Models> = {
  useModel: UseModel<M>;
  getModel: UseModel<M>;
};
type UseModelState<
  M extends Models = Models,
  Key extends keyof M = undefined,
> = {
  <K extends keyof M>(name: K): ExtractIModelStateFromModelConfig<
    Key extends undefined ? M[K] : M[Key]
  >;
};

type ModelStateAPI<M extends Models = Models> = {
  useModelState: UseModelState<M>;
  getModelState: UseModelState<M>;
};
type UseModelDispatchers<
  M extends Models = Models,
  Key extends keyof M = undefined,
> = {
  <K extends keyof M>(name: K): ExtractIModelDispatchersFromModelConfig<
    Key extends undefined ? M[K] : M[Key]
  >;
};
type ModelDispathersAPI<M extends Models = Models> = {
  useModelDispatchers: UseModelDispatchers<M>;
  getModelDispatchers: UseModelDispatchers<M>;
};
type UseModelEffectsLoading<
  M extends Models = Models,
  Key extends keyof M = undefined,
> = {
  <K extends keyof M>(name: K): ExtractIModelEffectsLoadingFromModelConfig<
    Key extends undefined ? M[K] : M[Key]
  >;
};
export type ModelEffectsLoadingAPI<M extends Models = Models> = {
  useModelEffectsLoading: UseModelEffectsLoading<M>;
};

type ModelAPI<M extends Models = Models> = ModelValueAPI<M> &
  ModelStateAPI<M> &
  ModelDispathersAPI<M> &
  ModelEffectsLoadingAPI<M>;

type ReduxHooks<M extends Models = Models> = {
  useSelector<TState = ExtractIcestoreStateFromModels<M>, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
  ): TSelected;
};

export type PresetIcestore<
  M extends Models = Models,
  A extends Action = Action,
> = Icestore<M, A> & ModelAPI<M> & ReduxHooks<M>;

export type Action<P = any, M = any> = {
  type: string;
  payload?: P;
  meta?: M;
};
export type ModelReducers<S = any> = {
  [key: string]: (state: S, payload: any, meta?: any) => S | void;
};
export type ModelEffects<S> = {
  [key: string]: (
    payload: any,
    effectContext: EffectContext,
    meta?: any,
  ) => void;
};
export type ModelComputed<S = any> = {
  [key: string]: (state: S) => unknown;
};

export type Models = {
  [key: string]: ModelConfig;
};
export type ModelHook = (model: Model) => void;
export type Validation = [boolean | undefined, string];
export interface Model<S = any, SS = S> extends ModelConfig<S, SS> {
  name: string;
  reducers: ModelReducers<S>;
}
export type ModelConfig<S = any, SS = S> = {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: ModelReducers<S>;
  effects?: ModelEffects<any>;
  computed?: ModelComputed<S>;
};
export interface PluginFactory extends Plugin {
  create(plugin: Plugin): Plugin;
}
export interface Plugin<M extends Models = Models, A extends Action = Action> {
  config?: InitConfig<M>;
  onInit?: () => void;
  onStoreCreated?: (store: Icestore<M, A>) => void;
  onModel?: ModelHook;
  middleware?: Middleware;
  exposed?: {
    [key: string]: any;
  };
  validate?(validations: Validation[]): void;
  storeDispatch?(action: Action, state: any): Redux.Dispatch<any> | undefined;
  storeGetState?(): any;
  dispatch?: IcestoreDispatch<M>;
  effects?: Record<string, any>;
  createDispatcher?(modelName: string, reducerName: string): void;
}
export type RootReducers = {
  [type: string]: Redux.Reducer<any, Action>;
};
export type DevtoolOptions = {
  disabled?: boolean;
  [key: string]: any;
};
export type InitConfigRedux<S = any> = {
  initialStates?: S;
  reducers?: ModelReducers;
  enhancers?: Redux.StoreEnhancer<any>[];
  middlewares?: Middleware[];
  rootReducers?: RootReducers;
  combineReducers?: (
    reducers: Redux.ReducersMapObject,
  ) => Redux.Reducer<any, Action>;
  createStore?: Redux.StoreCreator;
  devtoolOptions?: DevtoolOptions;
};
export interface InitConfig<M extends Models = Models> {
  name?: string;
  models?: M;
  plugins?: Plugin[];
  redux?: InitConfigRedux;
}
export type PrsetConfig = {
  disableImmer?: boolean;
  disableLoading?: boolean;
  disableError?: boolean;
};
export type CreateStoreConfig<M extends Models = Models> = InitConfig<M> &
  PrsetConfig;
export interface Config<M extends Models = Models> extends InitConfig {
  name: string;
  models: M;
  plugins: Plugin[];
  redux: ConfigRedux;
}
export type Middleware<
  DispatchExt = {},
  S = any,
  D extends Redux.Dispatch = Redux.Dispatch,
> = {
  (api: Redux.MiddlewareAPI<D, S>): (
    next: Redux.Dispatch<Action>,
  ) => (action: any, state?: any) => any;
};
export type ConfigRedux = {
  initialStates?: any;
  reducers: ModelReducers;
  enhancers: Redux.StoreEnhancer<any>[];
  middlewares: Middleware[];
  rootReducers?: RootReducers;
  combineReducers?: (
    reducers: Redux.ReducersMapObject,
  ) => Redux.Reducer<any, Action>;
  createStore?: Redux.StoreCreator;
  devtoolOptions?: DevtoolOptions;
};
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}

export type ThisModelConfig<
  S,
  R extends ModelReducers<S> = {},
  E extends ModelEffects<S> = {},
  C extends ModelComputed<S> = {},
  SS = S,
> = {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: R & ThisType<ExtractIModelDispatchersFromReducersObject<R>>;
  effects?: E &
    ThisType<
      ExtractIModelDispatchersFromReducersObject<R> &
        ExtractIModelDispatchersFromEffectsObject<E>
    >;
  computed?: C;
};

type ReturnModelConfig<
  S,
  R extends ModelReducers<S>,
  E extends ModelEffects<S>,
  C extends ModelComputed<S>,
  SS,
> = {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: R;
  effects?: E;
  computed?: C;
};
export function createModel<
  S,
  R extends ModelReducers<S>,
  E extends ModelEffects<S>,
  C extends ModelComputed<S>,
  SS = S,
>(config: ThisModelConfig<S, R, E, C, SS>) {
  return config as ReturnModelConfig<S, R, E, C, SS>;
}

interface EffectContext {
  rootState: any;
  rootDispatch: any;
}

export type ExtractEffectConfig<M extends Models> = {
  rootState: ExtractIcestoreStateFromModels<M>;
  rootDispatch: ExtractIcestoreDispatchersFromModels<M>;
};
