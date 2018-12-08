# ip-regex-builder

> Regular expression builder for validation of IP ranges. Support single IP, wildcards and ranges. IPv4 only.


## Install

```
$ npm install ip-regex-builder
```

## Usage

#### Regex building
```js
const {IpRule} = require('ip-regex-builder');

// single address
let ip = new IpRule('192.168.0.1');
ipRule.regex // /^192.168.0.1$/

// single address
let ip = new IpRule('192.168.0.*');
ipRule.regex // /^192\.168\.0(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){1}$/

// range
let ipRule = new IpRule('192.168.1.1', '192.168.0.7');
ipRule.regex // /^192\.168\.(0\.([7-9]|[1-9]\d|1(\d\d)|2([0-4]\d|5[0-5]))|1\.([0-1]))$/
```

#### IP validation
```js
const {validateIPv4} = require('ip-regex-builder');

validateIPv4('home 127.0.0.1') // true

//validation modes
// 0 - ip address (default)
validateIPv4('192.168.0.1', 0) // true
validateIPv4('192.168.0.*', 0) // false

// 1 - wildcard
validateIPv4('192.168.0.1', 1) // false
validateIPv4('192.168.0.*', 1) // true

// 2 - both
validateIPv4('192.168.0.1', 2) // true
validateIPv4('192.168.0.*', 2) // true

//strict mode
validateIPv4('home 127.0.0.1', 0, false) // true
validateIPv4('home 127.0.0.1', 0, true)  // false
validateIPv4('127.0.0.1', 0, true)       // true
```

## API

### validateIPv4(ip, [option], [isStrict])

Check is `ip` valid ip address and return result.

#### option

Type: `number`<br>
Default: `0` *type of validation (0 - ip only, 1 - wildcard ip, 2 - both)*

#### isStrict

Type: `boolean`<br>
Default: `false` *If `true` match only an exact string*


### IpRule(startIp, [endIp])

Constructor function. Return object with next properties:

#### value
Type: `string`<br>
*(Return rule)*

#### regex

Type: `string`<br>
*(Return regex that validate rule)*

#### isRange

Type: `boolean`<br>
*(Return `true` if rule is range)*

#### isWildcard

Type: `boolean`<br>
*(Return `true` if rule is wildcard)*
