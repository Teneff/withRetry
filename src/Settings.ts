import { Constructor } from "./Constructor";

export type Settings = {
  maxCalls: number;
  errors: Constructor<Error>[];
  delay: number;
};
