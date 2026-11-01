/**
 * Character classes used in BBAN structure strings.
 * Each block of a structure is a class letter followed by a two-digit repeat count, e.g. `F04` = four digits.
 */
const FORMATS: Readonly<Record<string, string>> = {
  A: '0-9A-Za-z',
  B: '0-9A-Z',
  C: 'A-Za-z',
  F: '0-9',
  L: 'a-z',
  U: 'A-Z',
  W: '0-9a-z',
};

/** Character code offsets used by the MOD 97-10 algorithm. */
const CHAR_0 = 48;
const CHAR_9 = 57;
const CHAR_A = 65;
const CHAR_Z = 90;
const CHAR_a = 97;
const CHAR_z = 122;

const isDigit = (code: number): boolean => code >= CHAR_0 && code <= CHAR_9;

/**
 * Computes `iban mod 97` as specified in ISO 7064 (MOD 97-10) on the ISO 13616 rearranged form of
 * the IBAN (BBAN first, then country code and check digits), where each letter A..Z is replaced by
 * the two digits 10..35.
 *
 * Runs in a single pass over the characters, keeping only a small integer remainder, so no
 * intermediate strings or regular expressions are needed. Letters may be upper or lower case.
 *
 * @param iban - An IBAN consisting of ASCII letters and digits only.
 * @returns The remainder in the range 0..96.
 * @throws {TypeError} If the input contains a character that is not an ASCII letter or digit.
 */
export const mod97 = (iban: string): number => {
  let remainder = 0;
  const length = iban.length;
  // Process BBAN (from index 4) first, then the country code and check digits (indexes 0..3).
  for (let i = 0; i < length; i++) {
    const code = iban.charCodeAt(i < length - 4 ? i + 4 : i - (length - 4));
    if (isDigit(code)) {
      remainder = (remainder * 10 + (code - CHAR_0)) % 97;
    } else if (code >= CHAR_A && code <= CHAR_Z) {
      // Letters expand to two digits (A=10 .. Z=35).
      remainder = (remainder * 100 + (code - CHAR_A + 10)) % 97;
    } else if (code >= CHAR_a && code <= CHAR_z) {
      remainder = (remainder * 100 + (code - CHAR_a + 10)) % 97;
    } else {
      throw new TypeError(`Invalid character in IBAN at position ${i}`);
    }
  }
  return remainder;
};

/**
 * Represents the IBAN specification of one country: its length, the structure of the underlying
 * BBAN (Basic Bank Account Number), an example IBAN, and registry metadata.
 */
export class Specification {
  /** Compiled regular expression that matches a valid BBAN for this country. */
  private readonly regex: RegExp;

  /**
   * Creates a new specification. The structure and example are validated eagerly so that a typo in
   * the country table fails at module load (and in tests) rather than at first use.
   *
   * @param countryCode - Two-letter ISO 3166-1 alpha-2 country code.
   * @param length - Total IBAN length including country code and check digits.
   * @param structure - BBAN structure, e.g. `U04F06F08` (4 uppercase letters, 6 digits, 8 digits).
   * @param example - A valid example IBAN for this country.
   * @param official - Whether the country is listed in the SWIFT IBAN Registry.
   * @param sepa - Whether the country is part of the SEPA zone.
   * @throws {Error} If the structure is malformed or the example length does not match.
   */
  constructor(
    public readonly countryCode: string,
    public readonly length: number,
    public readonly structure: string,
    public readonly example: string,
    public readonly official: boolean,
    public readonly sepa: boolean
  ) {
    this.regex = Specification.parseStructure(structure);
    if (example.length !== length) {
      throw new Error(`Invalid example for ${countryCode}: expected length ${length}, got ${example.length}`);
    }
  }

  /**
   * Checks if the given IBAN (electronic format) is valid according to this specification.
   * @param iban - The IBAN to validate.
   * @returns True if the IBAN is valid, false otherwise.
   */
  isValid(iban: string): boolean {
    return (
      this.length === iban.length &&
      this.countryCode === iban.slice(0, 2) &&
      isDigit(iban.charCodeAt(2)) &&
      isDigit(iban.charCodeAt(3)) &&
      this.regex.test(iban.slice(4)) &&
      mod97(iban) === 1
    );
  }

  /**
   * Converts the given IBAN (electronic format) to a country-specific BBAN.
   * Only the structure is checked, not the check digits; use {@link isValid} for full validation.
   * @param iban - The IBAN to convert.
   * @param separator - The separator to use between BBAN blocks.
   * @returns The BBAN, or undefined if the IBAN does not match this country's structure.
   */
  toBBAN(iban: string, separator: string = ' '): string | undefined {
    const match = this.regex.exec(iban.slice(4));
    return match ? match.slice(1).join(separator) : undefined;
  }

  /**
   * Converts the given BBAN (electronic format) to an IBAN according to this country's specification.
   * @param bban - The BBAN to convert.
   * @returns The corresponding IBAN with computed check digits.
   * @throws {Error} If the BBAN is invalid.
   */
  fromBBAN(bban: string): string {
    if (!this.isValidBBAN(bban)) {
      throw new Error('Invalid BBAN');
    }
    const remainder = mod97(this.countryCode + '00' + bban);
    const checkDigit = String(98 - remainder).padStart(2, '0');
    return this.countryCode + checkDigit + bban;
  }

  /**
   * Checks if the given BBAN (electronic format) is valid according to this specification.
   * @param bban - The BBAN to validate.
   * @returns True if the BBAN is valid, false otherwise.
   */
  isValidBBAN(bban: string): boolean {
    return this.length - 4 === bban.length && this.regex.test(bban);
  }

  /**
   * Parses a BBAN structure string into an anchored regular expression with one capture group per block.
   * @param structure - The structure to parse, e.g. `F05F05A11F02`.
   * @returns A RegExp derived from the BBAN structure.
   * @throws {Error} If the structure format or a pattern letter is invalid.
   */
  private static parseStructure(structure: string): RegExp {
    if (structure.length === 0 || structure.length % 3 !== 0) {
      throw new Error(`Invalid structure format: ${structure}`);
    }
    const parts: string[] = [];
    for (let i = 0; i < structure.length; i += 3) {
      const pattern = structure.charAt(i);
      const repeats = Number(structure.slice(i + 1, i + 3));
      const format = FORMATS[pattern];
      if (format === undefined) {
        throw new Error(`Invalid pattern: ${pattern}`);
      }
      if (!Number.isInteger(repeats) || repeats < 1) {
        throw new Error(`Invalid structure format: ${structure}`);
      }
      parts.push(`([${format}]{${repeats}})`);
    }
    return new RegExp(`^${parts.join('')}$`);
  }
}
