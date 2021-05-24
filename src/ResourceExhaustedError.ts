export class ResourceExhaustedError extends Error {
  constructor(readonly cause: Error[]) {
    super("Resource exhausted");
  }
}
