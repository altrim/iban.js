# iban-ts

## Overview

`iban-ts` is a TypeScript library forked from [iban.js](https://github.com/arhs/iban.js), designed for validating, formatting, and converting International Bank Account Numbers (IBAN) and Basic Bank Account Numbers (BBAN). 

## Installation

To install `iban-ts`, use npm or yarn:

```bash
npm install iban-ts
# or
yarn add iban-ts
```
## Usage
### Importing the Library
You can import the entire library or specific functions:

```ts
import * as IBAN from 'iban-ts';
// or
import { isValid, toBBAN, fromBBAN } from 'iban-ts';
```

### Validating an IBAN
To check if an IBAN is valid:

```ts
const valid = IBAN.isValid('DE89370400440532013000');
console.log(valid); // true or false
```

### Converting BBAN to IBAN
To convert a BBAN to an IBAN:

```ts
const iban = IBAN.fromBBAN('DE', '370400440532013000');
console.log(iban); // DE89370400440532013000
```

### Formatting an IBAN
To format an IBAN for printing:

```ts
const formatted = IBAN.printFormat('DE89370400440532013000', ' ');
console.log(formatted); // DE89 3704 0044 0532 0130 00
```

## API
    * isValid(iban)
    * toBBAN(iban, separator)
    * fromBBAN(countryCode, bban)
    * isValidBBAN(countryCode, bban)
    * printFormat(iban, separator)
    * electronicFormat(iban)
