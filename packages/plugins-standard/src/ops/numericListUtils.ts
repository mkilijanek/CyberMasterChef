export function parseNumberList(value: string, delimiter: string): number[] {
  const normalizedDelimiter = delimiter.length > 0 ? delimiter : " ";
  const tokens = value
    .split(normalizedDelimiter)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) {
    return [];
  }
  return tokens.map((token) => {
    const parsed = Number(token);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Invalid numeric token: ${token}`);
    }
    return parsed;
  });
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(12)));
}
