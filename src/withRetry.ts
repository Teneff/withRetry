import { Constructor } from "./Constructor";

export type Settings = {
  maxCalls: number;
  errors: Constructor<Error>[];
};

const defaults: Settings = {
  maxCalls: 2,
  errors: [Error],
};

type AsyncFn = (...args: any[]) => Promise<any>;

type WithRetry = (callback: AsyncFn) => AsyncFn;

type Await<T> = T extends Promise<infer R> ? R : never;

export function withRetry(options: Partial<Settings> = {}): WithRetry {
  const settings: Settings = { ...defaults, ...options };
  return function <CB extends (...args: any[]) => any>(callback: CB) {
    return async <A extends Parameters<CB>>(
      ...args: A
    ): Promise<Await<ReturnType<CB>>> => {
      try {
        return await callback(...args);
      } catch (err) {
        if (
          settings.maxCalls <= 1 ||
          !settings.errors.some((error) => err instanceof error)
        ) {
          throw err;
        }
        return await withRetry({
          ...settings,
          maxCalls: settings.maxCalls - 1,
        })(callback)(...args);
      }
    };
  };
}
