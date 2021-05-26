import { ResourceExhaustedError } from "./ResourceExhaustedError";
import { Settings } from "./Settings";

type WithRetry = <T, Y extends unknown[]>(
  callback: (...args: Y) => Promise<T>
) => (...args: Y) => Promise<T>;

const defaults = {
  maxCalls: 2,
  errors: [],
  delay: 0,
};

const sleep = async (intervalMs: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(() => resolve(), intervalMs));

export default function withRetry<E extends Error>(
  options: Partial<Settings<E>> = {}
): WithRetry {
  const settings: Settings<E> = { ...defaults, ...options };

  return <T, Y extends unknown[]>(
    callback: (...args: Y) => Promise<T>
  ): ((...args: Y) => Promise<T>) => {
    let { maxCalls } = settings;
    const errors: E[] = [];

    return async (
      ...args: Parameters<typeof callback>
    ): ReturnType<typeof callback> => {
      do {
        try {
          return await callback(...args);
        } catch (error) {
          errors.push(error);
          if (
            settings.errors.length &&
            !settings.errors.some(
              (errorConstructor) => error instanceof errorConstructor
            )
          ) {
            throw error;
          }
          if (maxCalls > 1 && settings.delay) {
            await (typeof settings.delay === "number"
              ? sleep(settings.delay)
              : sleep(
                  settings.delay({
                    call: settings.maxCalls - maxCalls,
                    errors: Array.from(errors),
                  })
                ));
          }
        }
      } while (--maxCalls);
      throw new ResourceExhaustedError(errors);
    };
  };
}
