/**
 * Normalizes a GROQ query string by collapsing whitespace to enable
 * consistent comparison regardless of formatting differences.
 *
 * @param query The GROQ query string to normalize
 * @returns The normalized query string with collapsed whitespace
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    // Replace all sequences of whitespace (spaces, tabs, newlines) with a single space
    .replace(/\s+/g, ' ')
}
