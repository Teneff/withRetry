import { Settings } from "./Settings";
import { withRetry } from "./withRetry";

export default function (options: Partial<Settings>) {
  return function <T, K extends keyof T>(
    target: T,
    propertyKey: K,
    descriptor: PropertyDescriptor
  ): void {
    Object.assign(descriptor, {
      value: withRetry(options)(descriptor.value),
    });
  };
}
