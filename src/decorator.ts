import withRetry from "./withRetry";

export default function <T>(...args: Parameters<typeof withRetry>) {
  return function <K extends string, V extends Record<K, (...args: any[]) => Promise<T>>>(
    target: V,
    propertyKey: K,
    descriptor?: TypedPropertyDescriptor<V[K]>
  ): any {
    const method = target[propertyKey];
    return Object.assign({}, descriptor, {
      value: withRetry(...args)(method),
    });
  };
}
