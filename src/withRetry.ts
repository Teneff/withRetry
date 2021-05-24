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
        } catch (error) {
          errors.push(error);
          if (!settings.errors.some((errorConstructor) => error instanceof errorConstructor)) {
            throw error;
          }
          if (--maxCalls && settings.delay) {
            await (typeof settings.delay === "number"
              ? sleep(settings.delay)
              : sleep(
                  settings.delay({
                    call: settings.maxCalls - maxCalls,
                    errors,
                  })
                ));
          }
        }
      } while (maxCalls);
      throw new ResourceExhaustedError(errors);
    };
  };
}
