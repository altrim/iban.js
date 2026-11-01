# Changelog

## 1.0.0 (2026-11-01)

### Breaking changes

- **Node.js 20 or newer** is required (`engines.node >= 20`).
- **Build output renamed.** The package now ships `dist/index.js` (ESM) and `dist/index.cjs` (CommonJS) with matching `.d.ts`/`.d.cts` declarations. Deep imports of the previous `dist/iban-ts.esm.js` or `dist/iban-ts.cjs.*.js` files no longer work; import the package root instead.
- **`countries` is frozen** and has a null prototype. Mutating it throws in strict mode.
- **`Specification` constructor** takes two extra required arguments: `official` and `sepa`.
- **Country specs corrected** to the SWIFT IBAN Registry (release 103, September 2026). IBANs that were wrongly accepted or rejected before may change result:
  - BI (Burundi): length 16 → 27, structure `F05F05F11F02`.
  - BR (Brazil): bank code and account type are now alphanumeric (`A08F05F10A01A01`).
  - DO (Dominican Republic): bank code is alphanumeric (`A04F20`).
  - IQ (Iraq): account number is numeric only (`U04F03F12`).
  - JO (Jordan): `U04F04A18` (4 letters bank, 4 digits branch, 18 alphanumeric account).
  - UA (Ukraine): account allows letters (`F06A19`).
  - Unofficial entries aligned with published national formats: DZ (26, `F22`), BF (28, `A02F22`), BJ (`A02F22`), ML (`A02F22`), SN (`U02F22`).

### Fixed

- **`require('iban-ts')` crashed** with `ReferenceError: module is not defined in ES module scope` because the package declared `"type": "module"` while its CommonJS entry used a `.js` extension. CommonJS consumers now get a proper `.cjs` build; the exports map is validated by publint and arethetypeswrong.
- `fromBBAN` and `isValidBBAN` now accept lowercase or padded country codes, matching `isValid`.
- Country lookups can no longer resolve `Object.prototype` keys such as `constructor`.
- `printFormat` rejects non-integer `groupSize` values with a `RangeError` and no longer builds a regular expression from user input.

### Added

- Registry countries: DJ, FK, HN, LY, MN, NI, OM, RU, SD, SO, YE, plus territory codes AX, GG, IM, JE.
- Unofficial countries: CF, CG, GA, GQ, GW, KM, MA, NE, TD, TG.
- `Specification.official` (listed in the SWIFT IBAN Registry) and `Specification.sepa` (SEPA zone) metadata.
- `Specification` class is exported.
- Registry parity test suite, CI workflow (Node 22 and 24), and a release workflow using npm trusted publishing with provenance.

### Changed

- Toolchain: `dts-cli` replaced by `tsdown`, `vitest`, `oxlint`, `prettier`, `publint`, `@arethetypeswrong/cli` and `size-limit` 14. TypeScript 7.0.
- MOD 97-10 check is a single integer pass with no intermediate strings; ~2x faster validation.
- Zero runtime dependencies (`tslib` removed).
