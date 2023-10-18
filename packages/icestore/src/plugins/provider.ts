import * as T from '../types';
import actionTypes from '../actionTypes';

const { SET_STATE } = actionTypes;

interface ProviderConfig {
  context: any;
  createElement: any;
  providerCpt: any;
}

export default ({ context, createElement, providerCpt }: ProviderConfig): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      const Provider = function (props) {
        const { children, initialStates } = props;
        if (initialStates) {
          Object.keys(initialStates).forEach((name) => {
            const initialState = initialStates[name];
            if (initialState && store.dispatch[name][SET_STATE]) {
              store.dispatch[name][SET_STATE](initialState);
            }
          });
        }
        return createElement(
          providerCpt,
          {
            store,
            context,
          },
          children,
        );
      };
      return { Provider, context };
    },
  };
};
