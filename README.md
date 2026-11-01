# iban-ts

[![npm version](https://img.shields.io/npm/v/iban-ts?label=npm&color=2B4BDB)](https://www.npmjs.com/package/iban-ts)
[![npm downloads](https://img.shields.io/npm/dm/iban-ts?color=2B4BDB)](https://www.npmjs.com/package/iban-ts)
[![bundle size](https://img.shields.io/bundlephobia/minzip/iban-ts?label=minzip)](https://bundlephobia.com/package/iban-ts)
[![CI](https://github.com/altrim/iban.js/actions/workflows/ci.yml/badge.svg)](https://github.com/altrim/iban.js/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/iban-ts)](https://www.npmjs.com/package/iban-ts)
[![license](https://img.shields.io/npm/l/iban-ts)](./LICENSE)

Validate, format and convert **IBAN** (International Bank Account Number) and **BBAN** (Basic Bank Account Number) in TypeScript.

- Every country in the **SWIFT IBAN Registry** (release 103, September 2026), plus 22 countries that use the IBAN format without being registered, flagged so you can exclude them.
- ISO 7064 MOD 97-10 check digits and per-country BBAN structure validation.
- Zero runtime dependencies. About 3 KB minified and compressed.
- **ESM and CommonJS** builds with TypeScript declarations. Node.js 20+, Bun, Deno, browsers and edge runtimes.
- Tolerant input: spaces, dashes and lowercase letters are accepted everywhere.

[Try it in the browser](https://altrim.github.io/iban.js/) or [read the usage guide](https://altrim.github.io/iban.js/#/guide).

## Install

```bash
npm install iban-ts
```

```ts
import { isValid } from 'iban-ts'; // ESM, TypeScript
const { isValid } = require('iban-ts'); // CommonJS
import { isValid } from 'npm:iban-ts'; // Deno
```

## Quick start

```ts
import { isValid, printFormat, electronicFormat, toBBAN, fromBBAN, isValidBBAN, countries } from 'iban-ts';

isValid('DE89 3704 0044 0532 0130 00'); // true
isValid('de89370400440532013000'); // true, case and separators do not matter
isValid('DE89370400440532013001'); // false, check digits do not match

printFormat('DE89370400440532013000'); // 'DE89 3704 0044 0532 0130 00'
electronicFormat('DE89 3704 0044 0532 0130 00'); // 'DE89370400440532013000'

toBBAN('DE89370400440532013000'); // '37040044 0532013000'
fromBBAN('DE', '370400440532013000'); // 'DE89370400440532013000'
isValidBBAN('DE', '370400440532013000'); // true

countries['DE'].length; // 22
countries['DE'].sepa; // true
countries['DZ'].official; // false, Algeria is not in the SWIFT registry
```

## Examples

### Validate user input in a form

`isValid` never throws for string input, so it is safe to call on every keystroke.

```ts
import { isValid, electronicFormat } from 'iban-ts';

function onSubmit(form: { iban: string }) {
  if (!isValid(form.iban)) {
    return { error: 'Please enter a valid IBAN.' };
  }
  // Store the canonical form, display the print form.
  return { iban: electronicFormat(form.iban) };
}
```

### Tell the user what is wrong

The library returns a plain boolean. If you want a reason, derive it from the country table:

```ts
import { countries, electronicFormat } from 'iban-ts';

type Reason = 'unknown-country' | 'length' | 'structure' | 'check-digits';

export function explain(input: string): Reason | null {
  const iban = electronicFormat(input);
  const spec = countries[iban.slice(0, 2)];
  if (!spec) return 'unknown-country';
  if (iban.length !== spec.length) return 'length';
  if (!spec.isValidBBAN(iban.slice(4))) return 'structure';
  if (!spec.isValid(iban)) return 'check-digits';
  return null;
}

explain('DE89 3704 0044 0532 0130'); // 'length'
explain('DE89 3704 0044 0532 0130 01'); // 'check-digits'
```

### Format for display and for storage

```ts
import { printFormat, electronicFormat } from 'iban-ts';

printFormat('GB29NWBK60161331926819'); // 'GB29 NWBK 6016 1331 9268 19'
printFormat('GB29NWBK60161331926819', '-'); // 'GB29-NWBK-6016-1331-9268-19'
printFormat('GB29NWBK60161331926819', ' ', 2); // 'GB 29 NW BK 60 16 13 31 92 68 19'
electronicFormat('GB29 NWBK 6016 1331 9268 19'); // 'GB29NWBK60161331926819'
```

### Convert between IBAN and a national account number

```ts
import { toBBAN, fromBBAN, isValidBBAN } from 'iban-ts';

toBBAN('BE68539007547034'); // '539 0075470 34'   bank, account, national check
toBBAN('BE68539007547034', ''); // '539007547034'
fromBBAN('be', '539-0075470-34'); // 'BE68539007547034'
isValidBBAN('BE', '1539007547034'); // false, one character too many
```

### Only accept SEPA countries, or only registered ones

```ts
import { countries, isValid, electronicFormat } from 'iban-ts';

export function isSepaIban(input: string): boolean {
  const iban = electronicFormat(input);
  return isValid(iban) && countries[iban.slice(0, 2)]?.sepa === true;
}

const sepaCountryCodes = Object.values(countries)
  .filter((c) => c.sepa)
  .map((c) => c.countryCode);

const registryOnly = Object.values(countries).filter((c) => c.official);
```

### Show the expected layout for a country

```ts
import { countries, printFormat } from 'iban-ts';

const nl = countries['NL'];
nl.length; // 18
nl.structure; // 'U04F10' -> 4 uppercase letters, 10 digits
printFormat(nl.example); // 'NL91 ABNA 0417 1643 00'
```

### Handle errors

| Function                          | Non-string input   | Unknown country | Invalid value              |
| --------------------------------- | ------------------ | --------------- | -------------------------- |
| `isValid`, `isValidBBAN`          | returns `false`    | returns `false` | returns `false`            |
| `electronicFormat`, `printFormat` | throws `TypeError` | n/a             | `RangeError` for bad group |
| `toBBAN`                          | throws `TypeError` | throws `Error`  | returns `undefined`        |
| `fromBBAN`                        | throws `TypeError` | throws `Error`  | throws `Error`             |

```ts
try {
  fromBBAN('XX', '123');
} catch (error) {
  (error as Error).message; // 'No country with code XX'
}
```

## API

| Export                                 | Returns                                   | Description                                                               |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| `isValid(iban)`                        | `boolean`                                 | Country, length, structure and check digits are all correct.              |
| `printFormat(iban, separator?, size?)` | `string`                                  | Groups characters for display. Defaults: space, groups of 4.              |
| `electronicFormat(iban)`               | `string`                                  | Strips non-alphanumerics and uppercases.                                  |
| `toBBAN(iban, separator?)`             | `string \| undefined`                     | BBAN blocks joined by the separator. Structure only, not check digits.    |
| `fromBBAN(countryCode, bban)`          | `string`                                  | Builds an IBAN with computed check digits.                                |
| `isValidBBAN(countryCode, bban)`       | `boolean`                                 | BBAN matches the country's structure.                                     |
| `countries`                            | `Readonly<Record<string, Specification>>` | Frozen map of country code to specification.                              |
| `Specification`                        | class                                     | Per-country metadata and the same operations without input normalization. |

### `Specification`

| Property      | Type      | Description                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------------- |
| `countryCode` | `string`  | Two-letter ISO 3166-1 code.                                                     |
| `length`      | `number`  | Total IBAN length.                                                              |
| `structure`   | `string`  | BBAN structure, e.g. `U04F06F08` (`F` digits, `U` uppercase, `A` alphanumeric). |
| `example`     | `string`  | A valid example IBAN.                                                           |
| `official`    | `boolean` | Listed in the SWIFT IBAN Registry.                                              |
| `sepa`        | `boolean` | Part of the SEPA zone.                                                          |

Methods `isValid(iban)`, `isValidBBAN(bban)`, `toBBAN(iban, separator)` and `fromBBAN(bban)` expect electronic-format input (no separators, uppercase country code). The top-level functions normalize input for you; prefer them.

## Supported countries

All 89 countries in the SWIFT IBAN Registry, including the 2021 to 2026 additions (Burundi, Djibouti, Falkland Islands, Honduras, Libya, Mongolia, Nicaragua, Oman, Russia, Somalia, Sudan, Yemen).

Territory codes AX, GG, IM, JE and the French overseas territories (BL, GF, GP, MF, MQ, NC, PF, PM, RE, TF, WF, YT) are included with their parent's structure. Banks issue IBANs for these territories under the parent code (FI, GB, FR), so you will rarely meet an IBAN starting with one of them.

Countries that use an IBAN-like format but are not in the registry (`official: false`): AO, BF, BJ, CF, CG, CI, CM, CV, DZ, GA, GQ, GW, IR, KM, MA, MG, ML, MZ, NE, SN, TD, TG.

## Compatibility

| Runtime                 | Status                                                 |
| ----------------------- | ------------------------------------------------------ |
| Node.js 20, 22, 24      | ESM `import` and CommonJS `require`                    |
| Bun, Deno               | ESM                                                    |
| Browsers, edge runtimes | ESM, no Node APIs used                                 |
| TypeScript              | 5.x and later; declarations ship for both module kinds |

## Development

```bash
npm install
npm run check   # lint, format, typecheck, test, build, package validation, size
```

The library runs on Node.js 20+; the build toolchain (tsdown) needs Node.js 22.18 or newer. Releases are published from CI with npm trusted publishing and provenance when a `v*` tag is pushed. See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Credits

Forked from [iban.js](https://github.com/arhs/iban.js) by Laurent VB and rewritten in TypeScript. MIT license.
