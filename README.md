# @teneff/withRetry

Legacy decorator for retrying async functions

## Options

Type: `object`

### options.maxCalls

Type: `number` **(default: `2`)**

Specifies the maximum amount of calls to the decorated function.

### options.errors

Type: `Error[]` **(default: `[Error]`)**

Specifies an array of errors for which the function should be retried. If the default option is used it will be retried for every error.

### options.delay

Type: `number | ({ call: number; errors: Error[] }) => number` **(default: 0)**

Specifies amount of delay before each retry.

- If a `number` is given after each Error the subsequent invocation will be delayed with a fixed amount.
- If a `function` returning `number` is given it will invoke the function and delay the invocations by the result

## Examples:

### as Babel [legacy decorator][legacy]

#### using [got][got]

```javascript
import got from 'got'
import withRetry from '@teneff/withRetry/legacy'

@withRetry({
    maxCalls: 5,
    errors: [got.TimeoutError],
})
export default function getFlakyServiceData() {
    return await got("https://example.com");
}
```

### as a function

#### using [got][got]

```javascript
import got from "got";
import withRetry from "@teneff/withRetry/legacy";

function getFlakyServiceData() {
  return await got("https://example.com");
}

export default withRetry({
  maxCalls: 5,
  errors: [got.TimeoutError],
})(getFlakyServiceData);
```

[got]: http://npmjs.com/package/got
[adyen]: http://npmjs.com/package/adyen
[legacy]: https://babeljs.io/docs/en/babel-plugin-proposal-decorators#legacy
