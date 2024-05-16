import withRetry from "./withRetry";

export default function <T>(...args: Parameters<typeof withRetry>) {
  return function <K extends string>(
    target: { [key in K]: (...args: any[]) => Promise<T> },
    propertyKey: K,
    descriptor?: TypedPropertyDescriptor<() => Promise<T>>
  ): any {
    const method = target[propertyKey];
    if (!method) return method;
    return Object.assign({}, descriptor, {
      value: withRetry(...args)(method),
    });
  };
}
