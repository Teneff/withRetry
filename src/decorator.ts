import withRetry from "./withRetry";

export default function (...args: Parameters<typeof withRetry>) {
  return function <T, K extends keyof T>(
    target: T,
    propertyKey: K,
    descriptor: PropertyDescriptor
  ): void {
    Object.assign(descriptor, {
      value: withRetry(...args)(descriptor.value),
    });
  };
}
