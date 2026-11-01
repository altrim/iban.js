import { countries, electronicFormat, type Specification } from 'iban-ts';

export type SegmentKind = 'country' | 'check' | 'a' | 'b' | 'c' | 'd';

export interface Segment {
  kind: SegmentKind;
  text: string;
  label: string;
  /** Human description of the character class and length, e.g. "4 letters". */
  description: string;
}

const CLASS_NAMES: Record<string, [singular: string, plural: string]> = {
  F: ['digit', 'digits'],
  U: ['letter', 'letters'],
  A: ['letter or digit', 'letters or digits'],
  B: ['uppercase letter or digit', 'uppercase letters or digits'],
  C: ['letter', 'letters'],
  L: ['lowercase letter', 'lowercase letters'],
  W: ['lowercase letter or digit', 'lowercase letters or digits'],
};

const describe = (pattern: string, length: number): string => {
  const names = CLASS_NAMES[pattern] ?? ['character', 'characters'];
  return `${length} ${length === 1 ? names[0] : names[1]}`;
};

const BLOCK_KINDS: SegmentKind[] = ['a', 'b', 'c', 'd'];

export interface Block {
  pattern: string;
  length: number;
  description: string;
  kind: SegmentKind;
}

/** Splits a structure string like "U04F06F08" into typed blocks. */
export function blocksOf(spec: Specification): Block[] {
  const blocks = spec.structure.match(/.{3}/g) ?? [];
  return blocks.map((block, index) => {
    const pattern = block.charAt(0);
    const length = Number(block.slice(1));
    return {
      pattern,
      length,
      description: describe(pattern, length),
      kind: BLOCK_KINDS[index % BLOCK_KINDS.length]!,
    };
  });
}

/**
 * Splits an IBAN (any formatting) into colored segments using the country's BBAN structure.
 * Characters beyond the expected length are appended as an extra "overflow" segment.
 */
export function segmentsOf(input: string): Segment[] {
  const iban = electronicFormat(input);
  if (iban.length === 0) return [];
  const segments: Segment[] = [];
  segments.push({ kind: 'country', text: iban.slice(0, 2), label: 'Country', description: '2 letters' });
  if (iban.length > 2) {
    segments.push({ kind: 'check', text: iban.slice(2, 4), label: 'Check digits', description: '2 digits' });
  }
  const spec = countries[iban.slice(0, 2)];
  let cursor = 4;
  if (spec) {
    for (const block of blocksOf(spec)) {
      if (cursor >= iban.length) break;
      segments.push({
        kind: block.kind,
        text: iban.slice(cursor, cursor + block.length),
        label: `Block ${segments.length - 1}`,
        description: block.description,
      });
      cursor += block.length;
    }
  }
  if (cursor < iban.length) {
    segments.push({
      kind: 'c',
      text: iban.slice(cursor),
      label: spec ? 'Extra' : 'BBAN',
      description: spec ? `${iban.length - cursor} characters too many` : 'unknown country',
    });
  }
  return segments;
}

export type Verdict =
  | { ok: true; spec: Specification }
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'country'; code: string }
  | { ok: false; reason: 'length'; spec: Specification; actual: number }
  | { ok: false; reason: 'check-digits'; spec: Specification }
  | { ok: false; reason: 'structure'; spec: Specification }
  | { ok: false; reason: 'checksum'; spec: Specification };

/** Explains why an IBAN is or is not valid, using only the public API of iban-ts. */
export function explain(input: string): Verdict {
  const iban = electronicFormat(input);
  if (iban.length === 0) return { ok: false, reason: 'empty' };
  const code = iban.slice(0, 2);
  const spec = countries[code];
  if (!spec) return { ok: false, reason: 'country', code };
  if (iban.length !== spec.length) return { ok: false, reason: 'length', spec, actual: iban.length };
  if (!/^[0-9]{2}$/.test(iban.slice(2, 4))) return { ok: false, reason: 'check-digits', spec };
  if (!spec.isValidBBAN(iban.slice(4))) return { ok: false, reason: 'structure', spec };
  if (!spec.isValid(iban)) return { ok: false, reason: 'checksum', spec };
  return { ok: true, spec };
}

/** Returns a copy of the IBAN with one digit changed, to demonstrate check-digit detection. */
export function corrupt(iban: string): string {
  const electronic = electronicFormat(iban);
  const index = electronic.search(/[0-9](?=[^0-9]*$)/);
  if (index < 4) return electronic;
  const flipped = String((Number(electronic[index]) + 1) % 10);
  return electronic.slice(0, index) + flipped + electronic.slice(index + 1);
}
