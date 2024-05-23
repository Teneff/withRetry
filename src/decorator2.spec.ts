import withRetry from "./decorator";

type Config = {
  method: string;
  url: string;
  headers: {
    "user-api-key": string;
  };
};

class ErrorOnWhichWeShouldRetry extends Error {}

class Example {
  configService = {
    get: <T extends string>(v: T): T => v,
  };
  httpService = {
    axiosRef: {
      request: async (config: Config) => ({
        data: JSON.stringify(config),
      }),
    },
  };

  @withRetry({
    errors: [ErrorOnWhichWeShouldRetry],
    maxCalls: 10,
    delay: 1000,
  })
  async acceptCredentialOffer(
    userCredentialOfferId: string,
    userApiKey: string,
    subjectId: string
  ) {
    const config = {
      method: "post",
      url: `${this.configService.get<string>(
        "prism.prismApiUrl"
      )}/accept-credential-offer/${userCredentialOfferId}?subjectId=${subjectId}`,
      headers: {
        "user-api-key": userApiKey,
      },
    };

    return this.httpService.axiosRef.request(config);
  }
}

describe("Example", () => {
  describe("acceptCredentialOffer", () => {
    it("should acceptCredentialOffer", () => {
      return expect(
        new Example().acceptCredentialOffer("a", "b", "c")
      ).resolves.toEqual({
        data: '{\"method\":\"post\",\"url\":\"prism.prismApiUrl/accept-credential-offer/a?subjectId=c\",\"headers\":{\"user-api-key\":\"b\"}}',
      });
    });
  });
});
