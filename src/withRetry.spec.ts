import { withRetry } from ".";

describe("withRetry", () => {
  describe("given a callback initially throwing error", () => {
    const mockCallback = jest
      .fn<Promise<string>, string[]>()
      .mockRejectedValueOnce(new Error("mock error"))
      .mockResolvedValue("success");
    let callbackWithRetry: (...args: string[]) => Promise<string>;
    let result: any;
    beforeAll(async () => {
      callbackWithRetry = withRetry()(mockCallback);

      result = await callbackWithRetry("arg1", "arg2");
    });

    it("should return a function", () => {
      expect(callbackWithRetry).toEqual(expect.any(Function));
    });

    it("should have called the callback twice", () => {
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it("should have called the callback with the given arguments", () => {
      expect(mockCallback).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should return the callback`s result", () => {
      expect(result).toEqual("success");
    });
  });

  describe("given retry count 4", () => {
    const mockCallback = jest
      .fn()
      .mockRejectedValueOnce(new Error("first error"))
      .mockRejectedValue(new Error("subsequent error"));
    let result: Promise<any>;
    beforeAll(() => {
      const callbackWithRetry = withRetry({ maxCalls: 4 })(mockCallback);
      result = callbackWithRetry("arg1", "arg2");
    });

    it("should have called the callback 4 times", async () => {
      await result.catch(() => undefined);
      expect(mockCallback).toHaveBeenCalledTimes(4);
    });

    it("should re-throw the last error", async () => {
      await expect(result).rejects.toEqual(new Error("subsequent error"));
    });
  });

  describe("given an Error[] and a callback rejecting with Error on third call", () => {
    class MockError1 extends Error {}
    class MockError2 extends Error {}

    const callback = jest.fn();

    let result: Promise<any>;
    beforeAll(() => {
      callback.mockClear();

      callback
        .mockRejectedValueOnce(new MockError1("msg"))
        .mockRejectedValueOnce(new MockError2("mock error message"))
        .mockRejectedValueOnce(new Error("should not retry"))
        .mockResolvedValue("result");

      const withRetryCallback = withRetry({
        maxCalls: 10,
        errors: [MockError1, MockError2],
      })(callback);
      result = withRetryCallback("hello");
    });

    it("should have called the callback 3 times", async () => {
      await result.catch(() => undefined);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should be rejected with an error", async () => {
      await expect(result).rejects.toEqual(new Error("should not retry"));
    });
  });
});
