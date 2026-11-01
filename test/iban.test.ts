import { describe, it, expect } from 'vitest';
import {
  countries,
  electronicFormat,
  fromBBAN,
  isValid,
  isValidBBAN,
  printFormat,
  Specification,
  toBBAN,
} from '../src/index';

describe('IBAN', function () {
  describe('.isValid', function () {
    it('should return false when input is not a String', function () {
      expect(isValid(1 as any)).toBe(false);
      expect(isValid([] as any)).toBe(false);
      expect(isValid({} as any)).toBe(false);
      expect(isValid(true as any)).toBe(false);
    });

    it('should return false for an unknown country code digit', function () {
      expect(isValid('ZZ68539007547034')).toBe(false);
    });

    it('should return true for a valid belgian IBAN', function () {
      expect(isValid('BE68539007547034')).toBe(true);
    });

    it('should return true for a valid Dutch IBAN', function () {
      expect(isValid('NL86INGB0002445588')).toBe(true);
    });

    it('should return true for a valid Moldovan IBAN', function () {
      expect(isValid('MD75EX0900002374642125EU')).toBe(true);
    });

    it('should return true for a valid Saint-Lucia IBAN', function () {
      expect(isValid('LC55HEMM000100010012001200023015')).toBe(true);
    });

    it('should return false for an incorrect check digit', function () {
      expect(isValid('BE68539007547035')).toBe(false);
    });

    it("should return true for a valid Côte d'Ivoire IBAN", function () {
      expect(isValid('CI93CI0080111301134291200589')).toBe(true);
    });

    it('should return true for all examples', function () {
      Object.keys(countries).forEach(function (countryCode) {
        expect(isValid(countries[countryCode]!.example)).toBe(true);
      });
    });

    it('should return false for all examples when modifying just one digit', function () {
      Object.keys(countries).forEach(function (countryCode) {
        const example = countries[countryCode]!.example;
        // Flip the last *digit* (some examples end in a letter) so the failure is the check, not the length.
        const index = example.search(/[0-9](?=[^0-9]*$)/);
        expect(index).toBeGreaterThan(3);
        const flipped = String((Number(example[index]) + 1) % 10);
        const corrupted = example.slice(0, index) + flipped + example.slice(index + 1);
        expect(corrupted).toHaveLength(example.length);
        expect(isValid(corrupted), countryCode).toBe(false);
      });
    });

    it('should reject letters in the check digit positions', function () {
      expect(isValid('BEI6539007547034')).toBe(false);
      expect(isValid('BEOX539007547034')).toBe(false);
    });

    it('should reject check digits outside the ISO 13616 range 02..98', function () {
      // 00, 01 and 99 can never be produced by 98 - (n mod 97)
      expect(isValid('BE00539007547034')).toBe(false);
      expect(isValid('BE01539007547034')).toBe(false);
      expect(isValid('BE99539007547034')).toBe(false);
    });

    it('should accept String objects', function () {
      expect(isValid(new String('BE68 5390 0754 7034') as unknown as string)).toBe(true);
      expect(printFormat(new String('BE68539007547034') as unknown as string)).toEqual('BE68 5390 0754 7034');
    });

    it('should return true for a valid Egypt IBAN', function () {
      expect(isValid('EG800002000156789012345180002')).toBe(true);
    });
  });

  describe('.electronicFormat', function () {
    it('should format a e-formatted belgian IBAN', function () {
      expect(electronicFormat('BE68539007547034')).toEqual('BE68539007547034');
    });

    it('should format a print-formatted belgian IBAN', function () {
      expect(electronicFormat('BE68 5390 0754 7034')).toEqual('BE68539007547034');
    });

    it('should throw TypeError when input is not a string', function () {
      expect(() => electronicFormat(123 as any)).toThrow(TypeError);
      expect(() => electronicFormat(null as any)).toThrow(TypeError);
      expect(() => electronicFormat(undefined as any)).toThrow(TypeError);
      expect(() => electronicFormat({} as any)).toThrow(TypeError);
    });

    it('should handle empty string', function () {
      expect(electronicFormat('')).toEqual('');
    });

    it('should convert lowercase to uppercase', function () {
      expect(electronicFormat('be68539007547034')).toEqual('BE68539007547034');
    });
  });

  describe('.printFormat', function () {
    it('should format a e-formatted belgian IBAN', function () {
      expect(printFormat('BE68539007547034')).toEqual('BE68 5390 0754 7034');
    });

    it('should format a print-formatted belgian IBAN', function () {
      expect(printFormat('BE68 5390 0754 7034')).toEqual('BE68 5390 0754 7034');
    });

    it('should throw TypeError when input is not a string', function () {
      expect(() => printFormat(123 as any)).toThrow(TypeError);
      expect(() => printFormat(null as any)).toThrow(TypeError);
      expect(() => printFormat(undefined as any)).toThrow(TypeError);
    });

    it('should throw RangeError when groupSize is less than 1', function () {
      expect(() => printFormat('BE68539007547034', ' ', 0)).toThrow(RangeError);
      expect(() => printFormat('BE68539007547034', ' ', -1)).toThrow(RangeError);
    });

    it('should support custom separator', function () {
      expect(printFormat('BE68539007547034', '-')).toEqual('BE68-5390-0754-7034');
    });

    it('should support custom group size', function () {
      expect(printFormat('BE68539007547034', ' ', 2)).toEqual('BE 68 53 90 07 54 70 34');
    });
  });

  describe('.toBBAN', function () {
    it('should output the right BBAN from a Belgian IBAN', function () {
      expect(toBBAN('BE68 5390 0754 7034', '-')).toEqual('539-0075470-34');
    });

    it('should use space as default separator', function () {
      expect(toBBAN('BE68 5390 0754 7034')).toEqual('539 0075470 34');
    });

    it('should throw TypeError when input is not a string', function () {
      expect(() => toBBAN(123 as any)).toThrow(TypeError);
      expect(() => toBBAN(null as any)).toThrow(TypeError);
      expect(() => toBBAN(undefined as any)).toThrow(TypeError);
    });

    it('should throw Error for unknown country code', function () {
      expect(() => toBBAN('ZZ68539007547034')).toThrow(/No country with code/);
    });

    it('should return undefined when the IBAN does not match the country structure', function () {
      expect(toBBAN('BE68ABC007547034')).toBeUndefined();
    });
  });

  describe('.fromBBAN', function () {
    it('should output the right IBAN from a Belgian BBAN', function () {
      expect(fromBBAN('BE', '539007547034')).toEqual('BE68539007547034');
    });

    it('should output the right IBAN from a Belgian BBAN, ignoring format', function () {
      expect(fromBBAN('BE', '539-0075470-34')).toEqual('BE68539007547034');
    });

    it('should throw an error if the BBAN is invalid', function () {
      expect(function () {
        fromBBAN('BE', '1539-0075470-34');
      }).toThrow(/Invalid BBAN/);
    });

    it('should throw TypeError when countryCode is not a string', function () {
      expect(() => fromBBAN(123 as any, '539007547034')).toThrow(TypeError);
      expect(() => fromBBAN(null as any, '539007547034')).toThrow(TypeError);
    });

    it('should throw TypeError when bban is not a string', function () {
      expect(() => fromBBAN('BE', 123 as any)).toThrow(TypeError);
      expect(() => fromBBAN('BE', null as any)).toThrow(TypeError);
    });

    it('should throw Error for unknown country code', function () {
      expect(() => fromBBAN('ZZ', '539007547034')).toThrow(/No country with code/);
    });
  });

  describe('.isValidBBAN', function () {
    it('should return false when bban is not a String', function () {
      expect(isValidBBAN('BE', 1 as any)).toBe(false);
      expect(isValidBBAN('BE', {} as any)).toBe(false);
      expect(isValidBBAN('BE', [] as any)).toBe(false);
      expect(isValidBBAN('BE', true as any)).toBe(false);
    });

    it('should return false when countryCode is not a String', function () {
      expect(isValidBBAN(123 as any, '539007547034')).toBe(false);
      expect(isValidBBAN(null as any, '539007547034')).toBe(false);
      expect(isValidBBAN(undefined as any, '539007547034')).toBe(false);
    });

    it('should validate a correct Belgian BBAN', function () {
      expect(isValidBBAN('BE', '539007547034')).toBe(true);
    });

    it('should return true for a valid Dutch BBAN', function () {
      expect(isValidBBAN('NL', 'INGB0002445588')).toBe(true);
    });

    it('should validate a correct Belgian BBAN, ignoring format', function () {
      expect(isValidBBAN('BE', '539-0075470-34')).toBe(true);
    });

    it('should detect invalid BBAN length', function () {
      expect(isValidBBAN('BE', '1539-0075470-34')).toBe(false);
    });

    it('should detect invalid BBAN format', function () {
      expect(isValidBBAN('BE', 'ABC-0075470-34')).toBe(false);
    });

    it('should return false for unknown country code', function () {
      expect(isValidBBAN('ZZ', '539007547034')).toBe(false);
    });
  });

  describe('.countries', function () {
    it('should export all country specifications', function () {
      expect(Object.keys(countries).length).toBeGreaterThan(100);
    });

    it('should have valid structure for each country', function () {
      Object.keys(countries).forEach((code) => {
        const spec = countries[code]!;
        expect(spec.countryCode).toBe(code);
        expect(spec.length).toBeGreaterThan(0);
        expect(spec.structure).toBeTruthy();
        expect(spec.example).toBeTruthy();
      });
    });
  });

  describe('input normalization', function () {
    it('should accept lowercase and print-formatted IBANs in isValid', function () {
      expect(isValid('be68 5390 0754 7034')).toBe(true);
    });

    it('should return false for empty or truncated input', function () {
      expect(isValid('')).toBe(false);
      expect(isValid('BE')).toBe(false);
      expect(isValid('BE68')).toBe(false);
    });

    it('should accept a lowercase or padded country code in fromBBAN and isValidBBAN', function () {
      expect(fromBBAN('be', '539007547034')).toEqual('BE68539007547034');
      expect(fromBBAN(' BE ', '539007547034')).toEqual('BE68539007547034');
      expect(isValidBBAN('be', '539007547034')).toBe(true);
    });

    it('should not resolve Object.prototype keys as country codes', function () {
      expect(() => fromBBAN('constructor', '539007547034')).toThrow(/No country with code/);
      expect(() => toBBAN('__proto__')).toThrow(/No country with code/);
      expect(isValidBBAN('constructor', '539007547034')).toBe(false);
      expect(isValidBBAN('hasOwnProperty', '539007547034')).toBe(false);
    });
  });

  describe('.printFormat edge cases', function () {
    it('should throw RangeError when groupSize is not an integer', function () {
      expect(() => printFormat('BE68539007547034', ' ', 1.5)).toThrow(RangeError);
      expect(() => printFormat('BE68539007547034', ' ', NaN)).toThrow(RangeError);
      expect(() => printFormat('BE68539007547034', ' ', Infinity)).toThrow(RangeError);
    });

    it('should return the whole IBAN when groupSize exceeds its length', function () {
      expect(printFormat('BE68539007547034', ' ', 100)).toEqual('BE68539007547034');
    });

    it('should format an empty string as an empty string', function () {
      expect(printFormat('')).toEqual('');
    });
  });

  describe('.fromBBAN check digits', function () {
    it('should compute two-digit check digits with leading zero', function () {
      // DE example from the registry
      expect(fromBBAN('DE', '370400440532013000')).toEqual('DE89370400440532013000');
      // MN example has check digit "12"; find one producing < 10 via a known registry example
      expect(fromBBAN('JE', 'ABCD12345612345678')).toEqual('JE06ABCD12345612345678');
    });

    it('should round-trip every example through toBBAN and fromBBAN', function () {
      for (const code of Object.keys(countries)) {
        const example = countries[code]!.example;
        const bban = toBBAN(example, '');
        expect(bban).toBeDefined();
        expect(fromBBAN(code, bban!)).toEqual(example);
      }
    });
  });

  describe('Specification', function () {
    it('should be exported and carry official/sepa metadata', function () {
      const de = countries['DE']!;
      expect(de).toBeInstanceOf(Specification);
      expect(de.official).toBe(true);
      expect(de.sepa).toBe(true);
      expect(countries['AE']!.sepa).toBe(false);
      expect(countries['DZ']!.official).toBe(false);
    });

    it('should reject an invalid structure at construction time', function () {
      expect(() => new Specification('ZZ', 10, 'X06', 'ZZ00000000', false, false)).toThrow(/Invalid pattern/);
      expect(() => new Specification('ZZ', 10, 'F0', 'ZZ00000000', false, false)).toThrow(/Invalid structure/);
    });

    it('should compute correct check digits for lowercase BBANs passed directly', function () {
      const md = countries['MD']!;
      expect(md.fromBBAN('ag000225100013104168')).toEqual('MD24ag000225100013104168');
      expect(md.isValid('MD24ag000225100013104168')).toBe(true);
      expect(md.isValid('md24ag000225100013104168')).toBe(false); // country code must be uppercase
    });

    it('should throw when the example does not match the length', function () {
      expect(() => new Specification('ZZ', 10, 'F06', 'ZZ00', false, false)).toThrow(/example/);
    });
  });

  describe('.countries immutability', function () {
    it('should be frozen', function () {
      expect(Object.isFrozen(countries)).toBe(true);
      expect(() => {
        (countries as Record<string, Specification>)['ZZ'] = countries['DE']!;
      }).toThrow(TypeError);
    });

    it('should have a null prototype', function () {
      expect(Object.getPrototypeOf(countries)).toBeNull();
    });
  });
});
