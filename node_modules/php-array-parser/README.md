<h1 align="center">PHP array Parser</h1>
<p align="center">Parse a PHP array into JavaScript!</p>

[![Build Status](https://travis-ci.org/rmariuzzo/php-array-parser.svg?branch=master)](https://travis-ci.org/rmariuzzo/php-array-parser)

## Installation

```shell
npm install php-array-parser
```

## Usage

```js
const parser = require('php-array-parser')
parser.parse(`
  array(
    "foo" => "bar",
    "bar" => "foo",
  );
`)

// > { foo: 'bar', bar: 'foo' }
```

#### Tests

```shell
npm run test
```
