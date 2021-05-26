import { Constructor } from "./Constructor";

type DelayCallback<E> = (arg: { call: number; errors: E[] }) => number;

export type Settings<E> = {
  maxCalls: number;
  errors: Constructor<E>[];
  delay: number | DelayCallback<E>;
};
