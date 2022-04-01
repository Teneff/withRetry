import { Settings } from "./Settings";
import { UnknownError } from "./UnknownError";
import { ResourceExhaustedError } from "./ResourceExhaustedError";

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

export default function withRetry(
  options: Partial<Settings<Error>> = {}
): WithRetry {
  const settings: Settings<Error> = { ...defaults, ...options };

  return <T, Y extends unknown[]>(
    callback: (...args: Y) => Promise<T>
  ): ((...args: Y) => Promise<T>) => {
    let { maxCalls } = settings;
    const errors: Error[] = [];

    return async (
      ...args: Parameters<typeof callback>
    ): ReturnType<typeof callback> => {
      do {
        try {
          return await callback(...args);
        } catch (error) {
          const e = error instanceof Error ? error : new UnknownError(error);

          errors.push(e);

          if (
            settings.errors.length &&
            !settings.errors.some(
              (errorConstructor) => e instanceof errorConstructor
            )
          ) {
            throw e;
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
