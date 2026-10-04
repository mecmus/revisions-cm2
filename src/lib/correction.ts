export type Token = { expected: string; given: string | null; ok: boolean };

const normalizeSpaces = (s: string) => s.replace(/[\u2019]/g, "'").replace(/\s+/g, " ").trim();

export function tokenize(s: string): string[] {
  return normalizeSpaces(s).match(/[\p{L}\p{N}'-]+|[.,;:!?«»"]/gu) ?? [];
}

/** Aligne la copie de l'élève sur le texte attendu (distance d'édition mot à mot). */
export function correct(expected: string, given: string): { tokens: Token[]; errors: number; total: number } {
  const a = tokenize(expected);
  const b = tokenize(given);
  const n = a.length, m = b.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const tokens: Token[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      tokens.unshift({ expected: a[i - 1], given: b[j - 1], ok: a[i - 1] === b[j - 1] }); i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      tokens.unshift({ expected: a[i - 1], given: null, ok: false }); i--;
    } else {
      j--; // mot en trop : compté comme erreur
      tokens.unshift({ expected: "", given: b[j], ok: false });
    }
  }
  const errors = tokens.filter((t) => !t.ok).length;
  return { tokens, errors, total: a.length };
}

/** Nombre de mots (hors ponctuation) — sert à suivre l'avancement de l'écriture. */
export function countWords(s: string): number {
  return tokenize(s).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}
