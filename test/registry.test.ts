import { describe, it, expect } from 'vitest';
import { countries, isValid, Specification } from '../src/index';

/**
 * SWIFT IBAN Registry, release 103 (September 2026).
 * Columns: country code, IBAN length, BBAN structure, in SEPA zone.
 * Structure notation: F = digits, U = uppercase letters, A = alphanumeric.
 */
const REGISTRY = `
AD 24 F04F04A12 Y
AE 23 F03F16 N
AL 28 F08A16 N
AT 20 F05F11 Y
AX 18 F03F11 Y
AZ 28 U04A20 N
BA 20 F03F03F08F02 N
BE 16 F03F07F02 Y
BG 22 U04F04F02A08 Y
BH 22 U04A14 N
BI 27 F05F05F11F02 N
BL 27 F05F05A11F02 Y
BR 29 A08F05F10A01A01 N
BY 28 A04F04A16 N
CH 21 F05A12 Y
CR 22 F04F14 N
CY 28 F03F05A16 Y
CZ 24 F04F16 Y
DE 22 F08F10 Y
DJ 27 F05F05F11F02 N
DK 18 F04F09F01 Y
DO 28 A04F20 N
EE 20 F02F14 Y
EG 29 F04F04F17 N
ES 24 F04F04F01F01F10 Y
FI 18 F03F11 Y
FK 18 U02F12 N
FO 18 F04F09F01 N
FR 27 F05F05A11F02 Y
GB 22 U04F06F08 Y
GE 22 U02F16 N
GF 27 F05F05A11F02 Y
GG 22 U04F06F08 Y
GI 23 U04A15 Y
GL 18 F04F09F01 N
GP 27 F05F05A11F02 Y
GR 27 F03F04A16 Y
GT 28 A04A20 N
HN 28 U04F20 N
HR 21 F07F10 Y
HU 28 F03F04F01F15F01 Y
IE 22 U04F06F08 Y
IL 23 F03F03F13 N
IM 22 U04F06F08 Y
IQ 23 U04F03F12 N
IS 26 F04F02F06F10 Y
IT 27 U01F05F05A12 Y
JE 22 U04F06F08 Y
JO 30 U04F04A18 N
KW 30 U04A22 N
KZ 20 F03A13 N
LB 28 F04A20 N
LC 32 U04A24 N
LI 21 F05A12 Y
LT 20 F05F11 Y
LU 20 F03A13 Y
LV 21 U04A13 Y
LY 25 F03F03F15 N
MC 27 F05F05A11F02 Y
MD 24 A02A18 N
ME 22 F03F13F02 N
MF 27 F05F05A11F02 Y
MK 19 F03A10F02 N
MN 20 F04F12 N
MQ 27 F05F05A11F02 Y
MR 27 F05F05F11F02 N
MT 31 U04F05A18 Y
MU 30 U04F02F02F12F03U03 N
NC 27 F05F05A11F02 Y
NI 28 U04F20 N
NL 18 U04F10 Y
NO 15 F04F06F01 Y
OM 23 F03A16 N
PF 27 F05F05A11F02 Y
PK 24 U04A16 N
PL 28 F08F16 Y
PM 27 F05F05A11F02 Y
PS 29 U04A21 N
PT 25 F04F04F11F02 Y
QA 29 U04A21 N
RE 27 F05F05A11F02 Y
RO 24 U04A16 Y
RS 22 F03F13F02 N
RU 33 F09F05A15 N
SA 24 F02A18 N
SC 31 U04F02F02F16U03 N
SD 18 F02F12 N
SE 24 F03F16F01 Y
SI 19 F05F08F02 Y
SK 24 F04F06F10 Y
SM 27 U01F05F05A12 Y
SO 23 F04F03F12 N
ST 25 F04F04F11F02 N
SV 28 U04F20 N
TF 27 F05F05A11F02 Y
TL 23 F03F14F02 N
TN 24 F02F03F13F02 N
TR 26 F05F01A16 N
UA 29 F06A19 N
VA 22 F03F15 Y
VG 24 U04F16 N
WF 27 F05F05A11F02 Y
XK 20 F04F10F02 N
YE 30 U04F04A18 N
YT 27 F05F05A11F02 Y
`
  .trim()
  .split('\n')
  .map((line) => {
    const [code, length, structure, sepa] = line.split(' ') as [string, string, string, string];
    return { code, length: Number(length), structure, sepa: sepa === 'Y' };
  });

/** Countries that use IBAN but are not (yet) in the SWIFT registry. */
const UNOFFICIAL = [
  'AO',
  'BF',
  'BJ',
  'CF',
  'CG',
  'CI',
  'CM',
  'CV',
  'DZ',
  'GA',
  'GQ',
  'GW',
  'IR',
  'KM',
  'MA',
  'MG',
  'ML',
  'MZ',
  'NE',
  'SN',
  'TD',
  'TG',
];

/** Expands "F04A12" into one character-class letter per BBAN position: "FFFFAAAAAAAAAAAA". */
const perPosition = (structure: string): string =>
  (structure.match(/.{3}/g) ?? []).map((block) => block.charAt(0).repeat(Number(block.slice(1)))).join('');

describe('SWIFT IBAN Registry parity', () => {
  it('covers exactly the 89 registry countries (plus territories) as official', () => {
    const official = Object.keys(countries)
      .filter((code) => countries[code]!.official)
      .sort();
    expect(official).toEqual(REGISTRY.map((r) => r.code).sort());
  });

  it.each(REGISTRY)('$code: length $length, structure $structure, sepa $sepa', ({ code, length, structure, sepa }) => {
    const spec = countries[code];
    expect(spec).toBeInstanceOf(Specification);
    expect(spec!.length).toBe(length);
    expect(perPosition(spec!.structure)).toBe(perPosition(structure));
    expect(spec!.official).toBe(true);
    expect(spec!.sepa).toBe(sepa);
    expect(spec!.example).toHaveLength(length);
    expect(isValid(spec!.example)).toBe(true);
  });

  it.each(UNOFFICIAL)('%s is present but flagged unofficial and non-SEPA', (code) => {
    const spec = countries[code];
    expect(spec).toBeInstanceOf(Specification);
    expect(spec!.official).toBe(false);
    expect(spec!.sepa).toBe(false);
    expect(isValid(spec!.example)).toBe(true);
  });

  it('contains no other country codes', () => {
    const known = new Set([...REGISTRY.map((r) => r.code), ...UNOFFICIAL]);
    expect(Object.keys(countries).filter((code) => !known.has(code))).toEqual([]);
  });
});

describe('registry corrections (regressions)', () => {
  it('BI: Burundi IBAN is 27 characters', () => {
    expect(isValid('BI4210000100010000332045181')).toBe(true);
    expect(isValid('BI41123456789012')).toBe(false);
  });

  it('BR: bank code and account type are alphanumeric', () => {
    expect(isValid('BR1800360305000010009795493C1')).toBe(true);
    expect(countries['BR']!.isValidBBAN('ABCDEFGH0000100097954931C')).toBe(true);
  });

  it('DO: bank code is alphanumeric', () => {
    expect(countries['DO']!.isValidBBAN('BAG100000001212453611324')).toBe(true);
  });

  it('IQ: account number is numeric only', () => {
    expect(countries['IQ']!.isValidBBAN('NBIQ850123456789012')).toBe(true);
    expect(countries['IQ']!.isValidBBAN('NBIQ850ABCDEFGHIJKL')).toBe(false);
  });

  it('JO: 4 letters bank, 4 digits branch, 18 alphanumeric account', () => {
    expect(countries['JO']!.isValidBBAN('AAAA1234567890123456789012')).toBe(true);
    expect(countries['JO']!.isValidBBAN('AAAAABCD567890123456789012')).toBe(false);
    expect(countries['JO']!.isValidBBAN('1234123456789012345678901A')).toBe(false);
  });

  it('UA: account allows letters', () => {
    expect(countries['UA']!.isValidBBAN('1234561234567890123456ABC')).toBe(true);
  });

  it('new registry countries validate', () => {
    for (const iban of [
      'DJ2100010000000154000100186',
      'FK88SC123456789012',
      'HN88CABF00000000000250005469',
      'LY83002048000020100120361',
      'MN121234123456789123',
      'NI45BAPR00000013000003558124',
      'OM810180000001299123456',
      'RU0204452560040702810412345678901',
      'SD2129010501234001',
      'SO211000001001000100141',
      'YE15CBYE0001018861234567891234',
    ]) {
      expect(isValid(iban), iban).toBe(true);
    }
  });
});
