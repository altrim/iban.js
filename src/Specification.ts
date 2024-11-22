const formats = {
  A: '0-9A-Za-z',
  B: '0-9A-Z',
  C: 'A-Za-z',
  F: '0-9',
  L: 'a-z',
  U: 'A-Z',
  W: '0-9a-z',
} as const;
/**
 * Represents a specification for validating and manipulating IBANs (International Bank Account Numbers).
 */
export class Specification {
  private _cachedRegex: RegExp | null = null;

  /**
   * Creates a new instance of Specification.
   * @param countryCode - The country code associated with the IBAN.
   * @param length - The total length of the IBAN.
   * @param structure - The structure of the underlying BBAN (Basic Bank Account Number).
   * @param example - An example of a valid IBAN for this specification.
   */
  constructor(
    public readonly countryCode: string,
    public readonly length: number,
    public readonly structure: string,
    public readonly example: string
  ) {}

  /**
   * Checks if the given IBAN is valid according to this specification.
   * @param iban - The IBAN to validate.
   * @returns True if the IBAN is valid, false otherwise.
   */
  isValid(iban: string): boolean {
    return (
      this.length === iban.length &&
      this.countryCode === iban.slice(0, 2) &&
      this._regex().test(iban.slice(4)) &&
      this.iso7064Mod97_10(this.iso13616Prepare(iban)) === 1
    );
  }

  /**
   * Converts the given IBAN to a country-specific BBAN.
   * @param iban - The IBAN to convert.
   * @param separator - The separator to use between BBAN blocks.
   * @returns The BBAN or undefined if the conversion fails.
   */
  toBBAN(iban: string, separator: string = ' '): string | undefined {
    const match = this._regex().exec(iban.slice(4));
    return match ? match.slice(1).join(separator) : undefined;
  }

  /**
   * Converts the given BBAN to an IBAN according to this country's specification.
   * @param bban - The BBAN to convert to IBAN.
   * @returns The corresponding IBAN.
   * @throws {Error} If the BBAN is invalid.
   */
  fromBBAN(bban: string): string {
    if (!this.isValidBBAN(bban)) {
      throw new Error('Invalid BBAN');
    }

    const prepared = this.iso13616Prepare(this.countryCode + '00' + bban);
    const checkDigit = String(98 - this.iso7064Mod97_10(prepared)).padStart(2, '0');

    return this.countryCode + checkDigit + bban;
  }

  /**
   * Checks if the given BBAN is valid according to this specification.
   * @param bban - The BBAN to validate.
   * @returns True if the BBAN is valid, false otherwise.
   */
  isValidBBAN(bban: string): boolean {
    return this.length - 4 === bban.length && this._regex().test(bban);
  }

  /**
   * Gets a lazily-loaded regex constructed based on the BBAN structure.
   * @returns The regular expression for validating the BBAN.
   */
  private _regex(): RegExp {
    if (!this._cachedRegex) {
      this._cachedRegex = this.parseStructure(this.structure);
    }
    return this._cachedRegex;
  }

  /**
   * Prepares an IBAN for MOD 97-10 computation as specified in ISO 13616.
   * @param iban - The IBAN to prepare.
   * @returns The prepared numeric IBAN string.
   */
  private iso13616Prepare(iban: string): string {
    const rearranged = (iban.slice(4) + iban.slice(0, 4)).toUpperCase();
    return rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());
  }

  /**
   * Parses the BBAN structure and returns a matching regular expression.
   * @param structure - The structure to parse.
   * @returns A RegExp derived from the BBAN structure.
   * @throws {Error} If the structure format is invalid.
   */
  private parseStructure(structure: string): RegExp {
    const blocks = structure.match(/.{3}/g);

    if (!blocks) {
      throw new Error(`Invalid structure format: ${structure}`);
    }

    const regexParts = blocks.map((block) => {
      const pattern = block.charAt(0);
      const repeats = parseInt(block.slice(1), 10);

      const format = formats[pattern as keyof typeof formats];

      if (!format) {
        throw new Error(`Invalid pattern: ${pattern}`);
      }

      return `([${format}]{${repeats}})`;
    });

    return new RegExp(`^${regexParts.join('')}$`);
  }

  /**
   * Calculates the MOD 97-10 of the passed IBAN as specified in ISO 7064.
   * @param iban - The IBAN to calculate the MOD 97-10 for.
   * @returns The MOD 97-10 result.
   */
  private iso7064Mod97_10(iban: string): number {
    let remainder = iban;
    let block: string;

    while (remainder.length > 2) {
      block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(block.length);
    }

    return parseInt(remainder, 10) % 97;
  }
}
