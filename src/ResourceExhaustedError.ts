export class ResourceExhaustedError<E extends Error> extends Error {
  constructor(readonly cause: E[]) {
    super("Resource exhausted");
  }
}
