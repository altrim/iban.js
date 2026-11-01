# iban-ts

[![npm](https://img.shields.io/npm/v/iban-ts)](https://www.npmjs.com/package/iban-ts)
[![CI](https://github.com/altrim/iban.js/actions/workflows/ci.yml/badge.svg)](https://github.com/altrim/iban.js/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/iban-ts)](./LICENSE)

Validate, format and convert **IBAN** (International Bank Account Number) and **BBAN** (Basic Bank Account Number) in TypeScript.

- Every country in the **SWIFT IBAN Registry** (release 103, September 2026) plus 22 countries that use IBAN but are not yet registered, flagged as unofficial.
- ISO 7064 MOD 97-10 check digits and per-country BBAN structure validation.
- Zero runtime dependencies, about 3 KB minified and compressed.
- Ships **ESM and CommonJS** builds with TypeScript declarations. Works in Node.js 20+, Bun, Deno and browsers.

Forked from [iban.js](https://github.com/arhs/iban.js) and rewritten in TypeScript. [Live demo](https://altrim.github.io/iban.js/).

## Installation

```bash
npm install iban-ts
```

## Usage

```ts
import { isValid, printFormat, electronicFormat, toBBAN, fromBBAN, isValidBBAN, countries } from 'iban-ts';

isValid('DE89 3704 0044 0532 0130 00'); // true (spaces and lowercase are tolerated)
isValid('DE89370400440532013001'); // false (bad check digits)

printFormat('DE89370400440532013000'); // 'DE89 3704 0044 0532 0130 00'
printFormat('DE89370400440532013000', '-', 2); // 'DE-89-37-04-...'
electronicFormat('de89 3704 0044 0532 0130 00'); // 'DE89370400440532013000'

toBBAN('DE89370400440532013000'); // '37040044 0532013000'
toBBAN('DE89370400440532013000', ''); // '370400440532013000'
fromBBAN('DE', '370400440532013000'); // 'DE89370400440532013000'
isValidBBAN('DE', '370400440532013000'); // true

countries['DE'].length; // 22
countries['DE'].sepa; // true
countries['DZ'].official; // false (not in the SWIFT registry)
```

CommonJS works too:

```js
const { isValid } = require('iban-ts');
```

## API

### `isValid(iban: string): boolean`

Returns `true` when the IBAN has a known country code, the right length, a BBAN matching the country's structure, and correct check digits. Non-alphanumeric characters are stripped and letters uppercased before validation. Returns `false` for non-string input.

### `printFormat(iban: string, separator = ' ', groupSize = 4): string`

Formats an IBAN for display by inserting `separator` between groups of `groupSize` characters. Throws `TypeError` for non-string input and `RangeError` if `groupSize` is not a positive integer.

### `electronicFormat(iban: string): string`

Removes all non-alphanumeric characters and uppercases the result. Throws `TypeError` for non-string input.

### `toBBAN(iban: string, separator = ' '): string | undefined`

Extracts the BBAN from an IBAN, joining its blocks (bank, branch, account, ...) with `separator`. Only the structure is checked; use `isValid` first if you also need the check digits verified. Returns `undefined` if the IBAN does not match the country's structure. Throws `TypeError` for non-string input and `Error` for an unknown country code.

### `fromBBAN(countryCode: string, bban: string): string`

Builds an IBAN from a country code and BBAN by computing the check digits. The country code is case-insensitive; separators in the BBAN are tolerated. Throws `TypeError` for non-string input and `Error` for an unknown country or invalid BBAN.

### `isValidBBAN(countryCode: string, bban: string): boolean`

Returns `true` when the BBAN matches the structure of the given country. Returns `false` for non-string input or an unknown country.

### `countries: Readonly<Record<string, Specification>>`

Frozen map of ISO 3166-1 alpha-2 country codes to their specification.

### `class Specification`

| Property      | Type      | Description                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------------- |
| `countryCode` | `string`  | Two-letter country code.                                                        |
| `length`      | `number`  | Total IBAN length.                                                              |
| `structure`   | `string`  | BBAN structure, e.g. `U04F06F08` (`F` digits, `U` uppercase, `A` alphanumeric). |
| `example`     | `string`  | A valid example IBAN.                                                           |
| `official`    | `boolean` | Listed in the SWIFT IBAN Registry.                                              |
| `sepa`        | `boolean` | Part of the SEPA zone.                                                          |

Methods: `isValid(iban)`, `isValidBBAN(bban)`, `toBBAN(iban, separator)`, `fromBBAN(bban)`. All expect electronic-format input.

## Supported countries

All 89 countries in the SWIFT IBAN Registry are supported, including the 2021 to 2026 additions (Burundi, Djibouti, Falkland Islands, Honduras, Libya, Mongolia, Nicaragua, Oman, Russia, Somalia, Sudan, Yemen) and the territory codes AX, GG, IM, JE and the French overseas territories.

Countries that use an IBAN-like format but are not in the registry (`official: false`): AO, BF, BJ, CF, CG, CI, CM, CV, DZ, GA, GQ, GW, IR, KM, MA, MG, ML, MZ, NE, SN, TD, TG. If you only want registry countries, check `countries[code].official`.

## Development

```bash
npm install
npm run check   # lint, format, typecheck, test, build, package validation, size
```

Releases are published from CI with npm trusted publishing and provenance when a `v*` tag is pushed.

## License

MIT
