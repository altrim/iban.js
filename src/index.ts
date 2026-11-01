import { countries } from './countries';
import { Specification } from './Specification';

export { countries, Specification };

const NON_ALPHANUM = /[^a-zA-Z0-9]/g;

/**
 * Type guard for strings (primitive or boxed).
 */
const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

/**
 * Looks up a country specification by code without touching Object.prototype.
 */
const lookup = (countryCode: string): Specification | undefined => countries[countryCode];

/**
 * Normalizes a user-supplied country code: trims whitespace and uppercases it.
 */
const normalizeCountryCode = (countryCode: string): string => countryCode.trim().toUpperCase();

/**
 * Removes non-alphanumeric characters from the string and converts it to uppercase.
 *
 * @param iban - The IBAN string to format.
 * @returns The IBAN in electronic format.
 * @throws {TypeError} If the input is not a string.
 */
export const electronicFormat = (iban: string): string => {
  if (!isString(iban)) {
    throw new TypeError('Expected iban to be a string');
  }
  return iban.replace(NON_ALPHANUM, '').toUpperCase();
};

/**
 * Validates an IBAN: known country, correct length, country-specific BBAN structure and
 * ISO 7064 MOD 97-10 check digits. Whitespace, separators and lowercase letters are tolerated.
 *
 * @param iban - The IBAN to validate.
 * @returns True if the IBAN is valid, false otherwise (including non-string input).
 */
export const isValid = (iban: string): boolean => {
  if (!isString(iban)) {
    return false;
  }
  const electronic = electronicFormat(iban);
  const spec = lookup(electronic.slice(0, 2));
  return spec !== undefined && spec.isValid(electronic);
};

/**
 * Converts an IBAN to a BBAN. Only the structure is checked, not the check digits.
 *
 * @param iban - The IBAN to convert.
 * @param separator - The separator to use between BBAN blocks, defaults to ' '.
 * @returns The BBAN, or undefined if the IBAN does not match the country's structure.
 * @throws {TypeError} If iban is not a string.
 * @throws {Error} If the country code is unknown.
 */
export const toBBAN = (iban: string, separator: string = ' '): string | undefined => {
  if (!isString(iban)) {
    throw new TypeError('Expected iban to be a string');
  }
  const electronic = electronicFormat(iban);
  const countryCode = electronic.slice(0, 2);
  const spec = lookup(countryCode);
  if (spec === undefined) {
    throw new Error('No country with code ' + countryCode);
  }
  return spec.toBBAN(electronic, separator);
};

/**
 * Converts a BBAN to an IBAN by computing the check digits for the given country.
 *
 * @param countryCode - The ISO country code (case-insensitive).
 * @param bban - The BBAN to convert; separators and lowercase letters are tolerated.
 * @returns The corresponding IBAN in electronic format.
 * @throws {TypeError} If countryCode or bban is not a string.
 * @throws {Error} If the country code is unknown or the BBAN is invalid.
 */
export const fromBBAN = (countryCode: string, bban: string): string => {
  if (!isString(countryCode)) {
    throw new TypeError('Expected countryCode to be a string');
  }
  if (!isString(bban)) {
    throw new TypeError('Expected bban to be a string');
  }
  const code = normalizeCountryCode(countryCode);
  const spec = lookup(code);
  if (spec === undefined) {
    throw new Error('No country with code ' + code);
  }
  return spec.fromBBAN(electronicFormat(bban));
};

/**
 * Checks the validity of a BBAN for the given country.
 *
 * @param countryCode - The ISO country code (case-insensitive).
 * @param bban - The BBAN to check; separators and lowercase letters are tolerated.
 * @returns True if the BBAN is valid, false otherwise (including non-string input).
 */
export const isValidBBAN = (countryCode: string, bban: string): boolean => {
  if (!isString(countryCode) || !isString(bban)) {
    return false;
  }
  const spec = lookup(normalizeCountryCode(countryCode));
  return spec !== undefined && spec.isValidBBAN(electronicFormat(bban));
};

/**
 * Formats an IBAN for printing by inserting a separator between groups of characters.
 *
 * @param iban - The IBAN to format.
 * @param separator - The separator to use between groups, defaults to ' '.
 * @param groupSize - The size of each group, defaults to 4. Must be a positive integer.
 * @returns The formatted IBAN string.
 * @throws {TypeError} If iban is not a string.
 * @throws {RangeError} If groupSize is not a positive integer.
 */
export const printFormat = (iban: string, separator: string = ' ', groupSize: number = 4): string => {
  if (!isString(iban)) {
    throw new TypeError('Expected iban to be a string');
  }
  if (!Number.isInteger(groupSize) || groupSize < 1) {
    throw new RangeError('Expected groupSize to be a positive integer');
  }
  const electronic = electronicFormat(iban);
  if (electronic.length <= groupSize) {
    return electronic;
  }
  const groups: string[] = [];
  for (let i = 0; i < electronic.length; i += groupSize) {
    groups.push(electronic.slice(i, i + groupSize));
  }
  return groups.join(separator);
};
