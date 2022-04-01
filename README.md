# @teneff/with-retry

Retry async functions when error happens

[![NPM version][npm-img-latest]][npm-url]
[![Build Status][build-img]][build-url]
[![Coverage Status][coverage-image]][coverage-url]
[![GitHub issues][issues-image]][issues-url]
[![GitHub stars][github-stars-img]][github-stars-url]

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

#### on request timeout using [got][got]

```javascript
import got from 'got'
import withRetry from '@teneff/with-retry'

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
import withRetry from "@teneff/with-retry";

function getFlakyServiceData() {
  return await got("https://example.com");
}

export default withRetry({
  maxCalls: 5,
  errors: [got.TimeoutError],
})(getFlakyServiceData);
```

### as an experimental decorator

```javascript
import got from "got";
import withRetry from '@teneff/with-retry/decorator'

class Example
  @withRetry({
    maxCalls: 5,
    errors: [got.TimeoutError],
  })
  getFlakyServiceData() {
    return await got("https://example.com");
  }
}
```

### v1.1.0
Adds support for unknown errors

```javascript
import withRetry, { UnknownError } from '@teneff/with-retry'

function resolvesPromiseWithNonError() {
  return Promise.reject('a string')
}

await withRetry({
  errors: UnknownError
})(resolvesPromiseWithNonError)()
```

[got]: http://npmjs.com/package/got
[legacy]: https://babeljs.io/docs/en/babel-plugin-proposal-decorators#legacy
[npm-img-latest]: https://img.shields.io/npm/v/@teneff/with-retry/latest.svg?logo=npm&style=flat
[npm-img-next]: https://img.shields.io/npm/v/@teneff/with-retry/next.svg?logo=npm&style=flat
[npm-url]: https://www.npmjs.com/package/@teneff/with-retry
[build-img]: https://github.com/teneff/withRetry/actions/workflows/build.yml/badge.svg?branch=master
[build-url]: https://github.com/teneff/withRetry/actions?query=branch%3Amaster
[coverage-image]: https://img.shields.io/codecov/c/github/Teneff/withRetry/master.svg?logo=codecov&style=flat
[coverage-url]: https://codecov.io/gh/Teneff/withRetry/branch/master
[issues-image]: https://img.shields.io/github/issues/Teneff/withRetry/bug.svg?logo=github&style=flat
[issues-url]: https://github.com/teneff/withRetry/issues
[github-stars-img]: https://img.shields.io/github/stars/teneff/withRetry.svg?logo=github&logoColor=fff
[github-stars-url]: https://github.com/teneff/withRetry/stargazers
