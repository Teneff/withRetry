import { ResourceExhaustedError } from "./ResourceExhaustedError";
import { Settings } from "./Settings";

 type WithRetry = <T, Y extends unknown[]>(
  callback: (...args: Y) => Promise<T>
) => (...args: Y) => Promise<T>;


const defaults: Settings = {
  maxCalls: 2,
  errors: [Error],
  delay: 0,
};

const sleep = async (intervalMs: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(() => resolve(), intervalMs));

export function withRetry(options: Partial<Settings> = {}): WithRetry {
  const settings: Settings = { ...defaults, ...options };
  let { maxCalls } = settings;

  return <T, Y extends unknown[]>(
    callback: (...args: Y) => Promise<T>
  ): ((...args: Y) => Promise<T>) => {
    return async (
      ...args: Parameters<typeof callback>
    ): ReturnType<typeof callback> => {
      const errors: Error[] = [];
      do {
        try {
          return await callback(...args);
        } catch (err) {
          errors.push(err);
          if (!settings.errors.some((error) => err instanceof error)) {
            throw err;
          }
          settings.delay && await sleep(settings.delay)
          maxCalls--;
        }
      } while (maxCalls >= 1);
      throw new ResourceExhaustedError(errors);
    };
  };
}
