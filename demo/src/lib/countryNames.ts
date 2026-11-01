/** Names for codes that Intl.DisplayNames may not know or names it in a way that reads oddly here. */
const FALLBACK: Record<string, string> = {
  XK: 'Kosovo',
  AX: 'Åland Islands',
  BL: 'Saint Barthélemy',
  MF: 'Saint Martin',
  PM: 'Saint Pierre and Miquelon',
  TF: 'French Southern Territories',
  WF: 'Wallis and Futuna',
  CI: "Côte d'Ivoire",
  PS: 'Palestine',
  VA: 'Vatican City',
  VG: 'British Virgin Islands',
};

let displayNames: Intl.DisplayNames | undefined;
try {
  displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  displayNames = undefined;
}

export function countryName(code: string): string {
  const fallback = FALLBACK[code];
  if (fallback) return fallback;
  try {
    const name = displayNames?.of(code);
    if (name && name !== code) return name;
  } catch {
    // unknown code
  }
  return code;
}
