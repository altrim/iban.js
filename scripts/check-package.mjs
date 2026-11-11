// Smoke-tests the built package exactly as consumers load it: CommonJS require() and ESM import,
// resolved through the package's own exports map (package self-reference).
// Run after `npm run build`. Exits non-zero on any mismatch.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const cjs = require('iban-ts');
const esm = await import('iban-ts');

const expected = [
  'countries',
  'electronicFormat',
  'fromBBAN',
  'isValid',
  'isValidBBAN',
  'printFormat',
  'toBBAN',
  'Specification',
];
const iban = 'DE89 3704 0044 0532 0130 00';
let failures = 0;
const check = (ok, message) => {
  if (!ok) {
    failures++;
    console.error(`FAIL: ${message}`);
  }
};

for (const name of expected) {
  check(name in cjs, `CJS build is missing export "${name}"`);
  check(name in esm, `ESM build is missing export "${name}"`);
}
check(cjs.isValid(iban) === true, 'CJS isValid returned false for a valid IBAN');
check(esm.isValid(iban) === true, 'ESM isValid returned false for a valid IBAN');
check(cjs.printFormat(iban) === esm.printFormat(iban), 'CJS and ESM printFormat disagree');
check(Object.keys(cjs.countries).length === Object.keys(esm.countries).length, 'CJS and ESM country counts differ');

// The library ships with zero runtime dependencies: anything listed here is installed by every consumer.
const { dependencies = {} } = require('iban-ts/package.json');
check(
  Object.keys(dependencies).length === 0,
  `package.json declares runtime dependencies: ${Object.keys(dependencies).join(', ')}`
);

if (failures > 0) {
  process.exit(1);
}
console.log(`package OK: ${Object.keys(esm.countries).length} countries, require() and import both work`);
