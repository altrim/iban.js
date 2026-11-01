/** Tiny TypeScript tokenizer for read-only code samples. Returns escaped HTML with span classes. */
const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'function',
  'return',
  'if',
  'else',
  'try',
  'catch',
  'type',
  'interface',
  'as',
  'typeof',
  'new',
  'true',
  'false',
  'null',
  'undefined',
  'throw',
  'await',
  'async',
  'for',
  'of',
  'default',
  'require',
]);

const escape = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOKEN =
  /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|(\s+|.)/gm;

export function highlight(code: string): string {
  let out = '';
  for (const m of code.matchAll(TOKEN)) {
    const [text, comment, str, num, call, word] = m;
    if (comment) out += `<span class="tok-comment">${escape(comment)}</span>`;
    else if (str) out += `<span class="tok-string">${escape(str)}</span>`;
    else if (num) out += `<span class="tok-number">${escape(num)}</span>`;
    else if (call)
      out += KEYWORDS.has(call) ? `<span class="tok-keyword">${call}</span>` : `<span class="tok-call">${call}</span>`;
    else if (word) out += KEYWORDS.has(word) ? `<span class="tok-keyword">${word}</span>` : escape(word);
    else out += escape(text);
  }
  return out;
}
