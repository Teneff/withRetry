import withRetry from "./decorator";

const mockCallback = jest
  .fn<Promise<string>, string[]>()
  .mockRejectedValueOnce(new Error("[1] mock error"))
  .mockRejectedValueOnce(new Error("[1] mock error"))
  .mockRejectedValueOnce(new Error("[1] mock error"))
  .mockResolvedValue("[1] success");

class Example {
  readonly mockCallback: jest.Mock<Promise<string>, string[], any>;

  constructor(public readonly num: number) {
    this.mockCallback = jest
      .fn<Promise<string>, string[]>()
      .mockRejectedValueOnce(new Error(`[${num}] mock error`))
      .mockResolvedValue(`[${num}] success`);
  }

  @withRetry({
    maxCalls: 4,
  })
  getData(): Promise<string> {
    return mockCallback("arg1", "arg2");
  }

  @withRetry({
    maxCalls: 4,
  })
  getData2(): Promise<string> {
    return this.mockCallback("arg1", "arg2");
  }
}

describe("decorator", () => {
  describe("Example1", () => {
    let result: Promise<string>;
    beforeAll(() => {
      result = new Example(1).getData();
    });

    it("should equal success", () => {
      return expect(result).resolves.toEqual("[1] success");
    });
  });

  describe("Example2", () => {
    const exmaple = new Example(2);
    let result: string;

    beforeAll(async () => {
      try {
        result = await exmaple.getData2();
      } catch {}
    });

    it("should preserve this reference", () => {
      return expect(result).toEqual("[2] success");
    });

    it("should have called mockCallback 2 times", () => {
      expect(exmaple.mockCallback).toHaveBeenCalledTimes(2);
    });
  });
});
