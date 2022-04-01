export class UnknownError extends Error {
  constructor(public readonly unknown: unknown) {
    super("Unknown error");
  }
}
