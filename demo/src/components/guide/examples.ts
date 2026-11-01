import { countries, electronicFormat, fromBBAN, isValid, isValidBBAN, printFormat, toBBAN } from 'iban-ts';

export interface Example {
  title: string;
  note: string;
  code: string;
  /** Runs the real library so the shown output is always what the package returns. */
  run?: () => unknown;
}

export interface Chapter {
  id: string;
  title: string;
  intro: string;
  examples: Example[];
}

type Reason = 'unknown-country' | 'length' | 'structure' | 'check-digits';
const explain = (input: string): Reason | null => {
  const iban = electronicFormat(input);
  const spec = countries[iban.slice(0, 2)];
  if (!spec) return 'unknown-country';
  if (iban.length !== spec.length) return 'length';
  if (!spec.isValidBBAN(iban.slice(4))) return 'structure';
  if (!spec.isValid(iban)) return 'check-digits';
  return null;
};

export const chapters: Chapter[] = [
  {
    id: 'install',
    title: 'Install and import',
    intro: 'One package, no dependencies. Both module systems are supported and typed.',
    examples: [
      {
        title: 'Install',
        note: 'Works with npm, pnpm, yarn and bun.',
        code: `npm install iban-ts`,
      },
      {
        title: 'Import',
        note: 'Tree-shakeable named exports. Pick what you need.',
        code: `
import { isValid, printFormat } from 'iban-ts'; // ESM, TypeScript
const { isValid } = require('iban-ts');          // CommonJS
import { isValid } from 'npm:iban-ts';            // Deno
`,
      },
    ],
  },
  {
    id: 'validate',
    title: 'Validate',
    intro:
      'isValid checks the country, the length, the national layout and the ISO 7064 check digits. It never throws for string input, so you can call it on every keystroke.',
    examples: [
      {
        title: 'Any formatting is accepted',
        note: 'Spaces, dashes and lowercase letters are stripped before validation.',
        code: `isValid('de89 3704-0044 0532 0130 00')`,
        run: () => isValid('de89 3704-0044 0532 0130 00'),
      },
      {
        title: 'A single wrong character fails',
        note: 'The MOD 97-10 check catches every single-character error and most transpositions.',
        code: `isValid('DE89 3704 0044 0532 0130 01')`,
        run: () => isValid('DE89 3704 0044 0532 0130 01'),
      },
      {
        title: 'Non-strings are simply invalid',
        note: 'Handy for untyped form data: no try/catch needed.',
        code: `isValid(undefined as unknown as string)`,
        run: () => isValid(undefined as unknown as string),
      },
      {
        title: 'Tell the user what is wrong',
        note: 'The library returns a boolean. If you need a reason, derive one from the country table in a few lines.',
        code: `
import { countries, electronicFormat } from 'iban-ts';

type Reason = 'unknown-country' | 'length' | 'structure' | 'check-digits';

function explain(input: string): Reason | null {
  const iban = electronicFormat(input);
  const spec = countries[iban.slice(0, 2)];
  if (!spec) return 'unknown-country';
  if (iban.length !== spec.length) return 'length';
  if (!spec.isValidBBAN(iban.slice(4))) return 'structure';
  if (!spec.isValid(iban)) return 'check-digits';
  return null;
}

explain('DE89 3704 0044 0532 0130')
`,
        run: () => explain('DE89 3704 0044 0532 0130'),
      },
    ],
  },
  {
    id: 'format',
    title: 'Format',
    intro:
      'Store the electronic form (no separators, uppercase) and show the print form (groups of four). Both functions throw a TypeError for non-string input.',
    examples: [
      {
        title: 'Print format for people',
        note: 'Defaults to a space every four characters.',
        code: `printFormat('GB29NWBK60161331926819')`,
        run: () => printFormat('GB29NWBK60161331926819'),
      },
      {
        title: 'Custom separator and group size',
        note: 'groupSize must be a positive integer, otherwise a RangeError is thrown.',
        code: `printFormat('GB29NWBK60161331926819', '-', 2)`,
        run: () => printFormat('GB29NWBK60161331926819', '-', 2),
      },
      {
        title: 'Electronic format for storage and APIs',
        note: 'The canonical form to persist and compare.',
        code: `electronicFormat('gb29 nwbk 6016 1331 9268 19')`,
        run: () => electronicFormat('gb29 nwbk 6016 1331 9268 19'),
      },
    ],
  },
  {
    id: 'convert',
    title: 'Convert to and from a BBAN',
    intro:
      'A BBAN is the national account number without the country code and check digits. iban-ts splits it into its blocks and can rebuild the IBAN with freshly computed check digits.',
    examples: [
      {
        title: 'IBAN to BBAN blocks',
        note: 'Blocks follow the national layout (for Belgium: bank, account, national check). Pass an empty separator for a plain string.',
        code: `toBBAN('BE68 5390 0754 7034')`,
        run: () => toBBAN('BE68 5390 0754 7034'),
      },
      {
        title: 'BBAN to IBAN',
        note: 'The country code is case-insensitive and separators in the BBAN are ignored.',
        code: `fromBBAN('be', '539-0075470-34')`,
        run: () => fromBBAN('be', '539-0075470-34'),
      },
      {
        title: 'Check a BBAN on its own',
        note: 'Length and layout only. There are no check digits to verify at this level.',
        code: `isValidBBAN('BE', '1539007547034')`,
        run: () => isValidBBAN('BE', '1539007547034'),
      },
      {
        title: 'Structure mismatch returns undefined',
        note: 'toBBAN does not throw for a wrong layout; it throws only for an unknown country code.',
        code: `toBBAN('BE68ABC007547034')`,
        run: () => toBBAN('BE68ABC007547034'),
      },
    ],
  },
  {
    id: 'countries',
    title: 'Country data',
    intro:
      'countries is a frozen map from country code to Specification. Use it to show expected layouts, restrict input to SEPA, or exclude countries that are not in the SWIFT registry.',
    examples: [
      {
        title: 'Read a specification',
        note: 'structure uses F for digits, U for uppercase letters and A for letters or digits, each followed by a length.',
        code: `
const nl = countries['NL'];
({ length: nl.length, structure: nl.structure, sepa: nl.sepa, example: nl.example })
`,
        run: () => {
          const nl = countries['NL']!;
          return { length: nl.length, structure: nl.structure, sepa: nl.sepa, example: nl.example };
        },
      },
      {
        title: 'Only accept SEPA IBANs',
        note: 'Combine isValid with the sepa flag.',
        code: `
function isSepaIban(input: string): boolean {
  const iban = electronicFormat(input);
  return isValid(iban) && countries[iban.slice(0, 2)]?.sepa === true;
}

isSepaIban('CH93 0076 2011 6238 5295 7')
`,
        run: () => {
          const iban = electronicFormat('CH93 0076 2011 6238 5295 7');
          return isValid(iban) && countries[iban.slice(0, 2)]?.sepa === true;
        },
      },
      {
        title: 'List registry countries only',
        note: '22 entries use the IBAN format without being in the SWIFT registry; they carry official: false.',
        code: `
Object.values(countries)
  .filter((c) => c.official)
  .map((c) => c.countryCode).length
`,
        run: () => Object.values(countries).filter((c) => c.official).length,
      },
    ],
  },
  {
    id: 'errors',
    title: 'Errors and edge cases',
    intro:
      'Validation functions return false; conversion and formatting functions throw, because a silent wrong result would be worse than an exception.',
    examples: [
      {
        title: 'Unknown country code',
        note: 'fromBBAN and toBBAN throw an Error whose message names the code.',
        code: `
try {
  fromBBAN('XX', '123');
} catch (error) {
  (error as Error).message;
}
`,
        run: () => {
          try {
            fromBBAN('XX', '123');
            return 'no error';
          } catch (error) {
            return (error as Error).message;
          }
        },
      },
      {
        title: 'Invalid BBAN',
        note: 'fromBBAN refuses to compute check digits for a BBAN that does not match the layout.',
        code: `
try {
  fromBBAN('DE', '12345');
} catch (error) {
  (error as Error).message;
}
`,
        run: () => {
          try {
            fromBBAN('DE', '12345');
            return 'no error';
          } catch (error) {
            return (error as Error).message;
          }
        },
      },
      {
        title: 'Letters in the check-digit positions',
        note: 'Positions 3 and 4 must be digits. Earlier versions accepted letters here; 1.0 does not.',
        code: `isValid('BEI6539007547034')`,
        run: () => isValid('BEI6539007547034'),
      },
    ],
  },
];
