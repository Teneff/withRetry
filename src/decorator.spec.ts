import withRetry from "./decorator";

const mockCallback = jest
  .fn<Promise<string>, string[]>()
  .mockRejectedValueOnce(new Error("mock error"))
  .mockRejectedValueOnce(new Error("mock error"))
  .mockRejectedValueOnce(new Error("mock error"))
  .mockResolvedValue("success");

class Example {
  @withRetry({
    maxCalls: 4,
  })
  getData(): Promise<string> {
    return mockCallback("arg1", "arg2");
  }
}

describe("decorator", () => {
  let result: Promise<string>;
  beforeAll(() => {
    result = new Example().getData();
  });

  it("should equal success", () => {
    return expect(result).resolves.toEqual("success");
  });
});
