import { Constructor } from "./Constructor";

type DelayCallback = (arg: { call: number; errors: Error[] }) => number;

export type Settings = {
  maxCalls: number;
  errors: Constructor<Error>[];
  delay: number | DelayCallback;
};
