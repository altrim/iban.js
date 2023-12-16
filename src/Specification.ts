const A = 'A'.charCodeAt(0);

/**
 * Represents a specification for validating and manipulating IBANs (International Bank Account Numbers).
 */
export class Specification {
  countryCode: string;
  length: number;
  structure: string;
  example: string;
  private _cachedRegex: RegExp | null = null;

  /**
   * Creates a new instance of Specification.
   * @param countryCode - The country code associated with the IBAN.
   * @param length - The total length of the IBAN.
   * @param structure - The structure of the underlying BBAN (Basic Bank Account Number).
   * @param example - An example of a valid IBAN for this specification.
   */
  constructor(countryCode: string, length: number, structure: string, example: string) {
    this.countryCode = countryCode;
    this.length = length;
    this.structure = structure;
    this.example = example;
  }

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
    return this._regex()?.exec(iban.slice(4))?.slice(1).join(separator);
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
    const checkDigit = ('0' + (98 - this.iso7064Mod97_10(prepared))).slice(-2);

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
   * Prepares an IBAN for mod 97 computation as specified in ISO13616.
   * @param iban - The IBAN to prepare.
   * @returns The prepared IBAN.
   */
  private iso13616Prepare(iban: string): string {
    iban = iban.toUpperCase();
    iban = iban.substr(4) + iban.substr(0, 4);

    return iban.replace(/[A-Z]/g, (match) => (match.charCodeAt(0) - A + 10).toString());
  }
  /**
   * Parses the BBAN structure and returns a matching regular expression.
   * @param structure - The structure to parse.
   * @returns A RegExp derived from the BBAN structure.
   */
  private parseStructure(structure: string): RegExp {
    const formats: { [key: string]: string } = {
      A: '0-9A-Za-z',
      B: '0-9A-Z',
      C: 'A-Za-z',
      F: '0-9',
      L: 'a-z',
      U: 'A-Z',
      W: '0-9a-z',
    };

    const regex = structure
      .match(/.{3}/g)
      ?.map((block) => {
        const [pattern, repeats] = [block[0], parseInt(block.slice(1), 10)];

        if (!formats[pattern]) {
          throw new Error(`Invalid pattern: ${pattern}`);
        }

        return `([${formats[pattern]}]{${repeats}})`;
      })
      .join('');

    return new RegExp(`^${regex}$`);
  }

  /**
   * Calculates the MOD 97 10 of the passed IBAN as specified in ISO7064.
   * @param iban - The IBAN to calculate the MOD 97 10 for.
   * @returns The MOD 97 10 result.
   */
  private iso7064Mod97_10(iban: string): number {
    let remainder = iban;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length);
    }

    return parseInt(remainder, 10) % 97;
  }
}
