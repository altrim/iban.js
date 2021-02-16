import {
  countries,
  electronicFormat,
  fromBBAN,
  isValid,
  isValidBBAN,
  printFormat,
  toBBAN,
} from '../src/index';

describe('IBAN', function() {
  describe('.isValid', function() {
    it('should return false when input is not a String', function() {
      expect(isValid(1 as any)).toBe(false);
      expect(isValid([] as any)).toBe(false);
      expect(isValid({} as any)).toBe(false);
      expect(isValid(true as any)).toBe(false);
    });

    it('should return false for an unknown country code digit', function() {
      expect(isValid('ZZ68539007547034')).toBe(false);
    });

    it('should return true for a valid belgian IBAN', function() {
      expect(isValid('BE68539007547034')).toBe(true);
    });

    it('should return true for a valid Dutch IBAN', function() {
      expect(isValid('NL86INGB0002445588')).toBe(true);
    });

    it('should return true for a valid Moldovan IBAN', function() {
      expect(isValid('MD75EX0900002374642125EU')).toBe(true);
    });

    it('should return true for a valid Saint-Lucia IBAN', function() {
      expect(isValid('LC55HEMM000100010012001200023015')).toBe(true);
    });

    it('should return false for an incorrect check digit', function() {
      expect(isValid('BE68539007547035')).toBe(false);
    });

    it("should return true for a valid Côte d'Ivoire IBAN", function() {
      expect(isValid('CI93CI0080111301134291200589')).toBe(true);
    });

    it('should return true for all examples', function() {
      Object.keys(countries).forEach(function(countryCode) {
        expect(isValid(countries[countryCode].example)).toBe(true);
      });
    });

    it('should return false for all examples when modifying just one digit', function() {
      Object.keys(countries).forEach(function(countryCode) {
        var num = countries[countryCode].example;
        num = num.slice(0, -1) + ((parseInt(num.slice(-1), 10) + 1) % 10);
        expect(isValid(num)).toBe(false);
      });
    });

    it('should return true for a valid Egypt IBAN', function() {
      expect(isValid('EG800002000156789012345180002')).toBe(true);
    });
  });

  describe('.electronicFormat', function() {
    it('should format a e-formatted belgian IBAN', function() {
      expect(electronicFormat('BE68539007547034')).toEqual('BE68539007547034');
    });

    it('should format a print-formatted belgian IBAN', function() {
      expect(electronicFormat('BE68 5390 0754 7034')).toEqual(
        'BE68539007547034'
      );
    });
  });

  describe('.printFormat', function() {
    it('should format a e-formatted belgian IBAN', function() {
      expect(printFormat('BE68539007547034')).toEqual('BE68 5390 0754 7034');
    });

    it('should format a print-formatted belgian IBAN', function() {
      expect(printFormat('BE68 5390 0754 7034')).toEqual('BE68 5390 0754 7034');
    });
  });

  describe('.toBBAN', function() {
    it('should output the right BBAN from a Belgian IBAN', function() {
      expect(toBBAN('BE68 5390 0754 7034', '-')).toEqual('539-0075470-34');
    });

    it('should use space as default separator', function() {
      expect(toBBAN('BE68 5390 0754 7034')).toEqual('539 0075470 34');
    });
  });

  describe('.fromBBAN', function() {
    it('should output the right IBAN from a Belgian BBAN', function() {
      expect(fromBBAN('BE', '539007547034')).toEqual('BE68539007547034');
    });

    it('should output the right IBAN from a Belgian BBAN, ignoring format', function() {
      expect(fromBBAN('BE', '539-0075470-34')).toEqual('BE68539007547034');
    });

    it('should throw an error if the BBAN is invalid', function() {
      expect(function() {
        fromBBAN('BE', '1539-0075470-34');
      }).toThrow(/Invalid BBAN/);
    });
  });

  describe('.isValidBBAN', function() {
    it('should return false when input is not a String', function() {
      expect(isValidBBAN('BE', 1 as any)).toBe(false);
      expect(isValidBBAN('BE', {} as any)).toBe(false);
      expect(isValidBBAN('BE', [] as any)).toBe(false);
      expect(isValidBBAN('BE', true as any)).toBe(false);
    });

    it('should validate a correct Belgian BBAN', function() {
      expect(isValidBBAN('BE', '539007547034')).toBe(true);
    });

    it('should return true for a valid Dutch IBAN', function() {
      expect(isValidBBAN('NL', 'INGB0002445588')).toBe(true);
    });

    it('should validate a correct Belgian BBAN, ignoring format', function() {
      expect(isValidBBAN('BE', '539-0075470-34')).toBe(true);
    });

    it('should detect invalid BBAN length', function() {
      expect(isValidBBAN('BE', '1539-0075470-34')).toBe(false);
    });

    it('should detect invalid BBAN format', function() {
      expect(isValidBBAN('BE', 'ABC-0075470-34')).toBe(false);
    });
  });
});
