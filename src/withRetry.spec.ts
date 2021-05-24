import { withRetry, ResourceExhaustedError } from ".";

jest.useFakeTimers();

describe("withRetry", () => {
  describe("given a callback initially throwing error", () => {
    const mockCallback = jest
      .fn<Promise<string>, string[]>()
      .mockRejectedValueOnce(new Error("mock error"))
      .mockResolvedValue("success");

    let callbackWithRetry: (...args: string[]) => Promise<string>;

    let result: string;
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
      .fn<Promise<string>, string[]>()
      .mockRejectedValueOnce(new Error("first error"))
      .mockRejectedValue(new Error("subsequent error"));

    let result: Promise<string>;
    beforeAll(() => {
      const callbackWithRetry = withRetry({ maxCalls: 4 })(mockCallback);
      result = callbackWithRetry("arg1", "arg2");
    });

    it("should have called the callback 4 times", async () => {
      await result.catch(() => undefined);
      expect(mockCallback).toHaveBeenCalledTimes(4);
    });

    it("should throw ResourceExhaustedError", async () => {
      await expect(result).rejects.toBeInstanceOf(ResourceExhaustedError);
    });

    it("should contain previous errors", async () => {
      await expect(result).rejects.toHaveProperty(
        "cause",
        new Array(4).fill(expect.any(Error))
      );
    });
  });

  describe("given an Error[] and a callback rejecting with Error on third call", () => {
    class MockError1 extends Error {}
    class MockError2 extends Error {}

    const callback = jest.fn<Promise<string>, [string]>();

    let result: Promise<string>;
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

  describe("given 1 second delay", () => {
    const mockCallback = jest.fn<Promise<string>, [string, string]>(() => {
      throw new Error("subsequent error");
    });

    let result: Promise<string>;

    beforeAll(() => {
      const callbackWithRetry = withRetry({ maxCalls: 4, delay: 300 })(
        mockCallback
      );
      result = callbackWithRetry("arg1", "arg2");
    });

    describe("after half 100 millisecond", () => {
      beforeAll(() => {
        jest.advanceTimersByTime(100);
      });

      it("should have called the callback 1 time", () => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
      });
    });

    describe("after a seconds", () => {
      beforeAll(() => {
        jest.advanceTimersByTime(1000);
      });

      it("should have called the callback 2 times", () => {
        expect(mockCallback).toHaveBeenCalledTimes(2);
      });

      describe("after another seconds", () => {
        beforeAll(() => {
          jest.advanceTimersByTime(1000);
        });

        it("should have called the callback 3 times", () => {
          expect(mockCallback).toHaveBeenCalledTimes(3);
        });

        describe("after another seconds", () => {
          beforeAll(() => {
            jest.advanceTimersByTime(1000);
          });

          it("should have called the callback 4 times", () => {
            expect(mockCallback).toHaveBeenCalledTimes(4);
          });

          describe("after another seconds", () => {
            beforeAll(() => {
              jest.advanceTimersByTime(1000);
            });

            it("should have called the callback again 4 times", () => {
              expect(mockCallback).toHaveBeenCalledTimes(4);
            });

            it("should throw ResourceExhaustedError", async () => {
              await expect(result).rejects.toBeInstanceOf(
                ResourceExhaustedError
              );
            });

            it("should contain previous errors", async () => {
              await expect(result).rejects.toHaveProperty(
                "cause",
                new Array(4).fill(expect.any(Error))
              );
            });
          });
        });
      });
    });
  });
});
