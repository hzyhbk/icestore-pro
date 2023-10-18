export default function mergeStateAndComputed(
  modelConfig: { computed?: any },
  state: any,
) {
  if (modelConfig && modelConfig.computed) {
    const computedValue = {} as any;
    for (const computedKey in modelConfig.computed) {
      computedValue[computedKey] = modelConfig.computed[computedKey](state);
    }
    return { ...state, ...computedValue };
  }
  return state;
}
