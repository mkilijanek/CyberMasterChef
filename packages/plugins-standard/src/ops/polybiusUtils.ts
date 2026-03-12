function normalizeKeyword(value: unknown): string {
  return typeof value === "string" ? value.toUpperCase().replace(/J/g, "I") : "";
}

function normalizeText(value: string): string {
  return value.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
}

export function createPolybiusSquare(keyword: unknown): string[] {
  const seen = new Set<string>();
  const chars = `${normalizeKeyword(keyword)}ABCDEFGHIKLMNOPQRSTUVWXYZ`;
  const square: string[] = [];
  for (const char of chars) {
    if (char < "A" || char > "Z" || char === "J" || seen.has(char)) continue;
    seen.add(char);
    square.push(char);
  }
  return square;
}

export function bifidEncodeText(input: string, keyword: unknown, period: unknown): string {
  const normalized = normalizeText(input);
  if (normalized.length === 0) return "";
  const blockPeriod =
    typeof period === "number"
      ? Math.floor(period)
      : typeof period === "string" && period.trim() !== ""
        ? Number.parseInt(period, 10)
        : 5;
  if (!Number.isInteger(blockPeriod) || blockPeriod < 2) {
    throw new Error("Period must be an integer greater than or equal to 2");
  }

  const square = createPolybiusSquare(keyword);
  const positions = new Map(square.map((char, index) => [char, index]));
  let output = "";

  for (let offset = 0; offset < normalized.length; offset += blockPeriod) {
    const block = normalized.slice(offset, offset + blockPeriod);
    const rows: number[] = [];
    const cols: number[] = [];
    for (const char of block) {
      const index = positions.get(char)!;
      rows.push(Math.floor(index / 5));
      cols.push(index % 5);
    }
    const merged = [...rows, ...cols];
    for (let index = 0; index < block.length; index += 1) {
      const squareIndex = merged[index * 2]! * 5 + merged[index * 2 + 1]!;
      output += square[squareIndex]!;
    }
  }

  return output;
}

export function bifidDecodeText(input: string, keyword: unknown, period: unknown): string {
  const normalized = normalizeText(input);
  if (normalized.length === 0) return "";
  const blockPeriod =
    typeof period === "number"
      ? Math.floor(period)
      : typeof period === "string" && period.trim() !== ""
        ? Number.parseInt(period, 10)
        : 5;
  if (!Number.isInteger(blockPeriod) || blockPeriod < 2) {
    throw new Error("Period must be an integer greater than or equal to 2");
  }

  const square = createPolybiusSquare(keyword);
  const positions = new Map(square.map((char, index) => [char, index]));
  let output = "";

  for (let offset = 0; offset < normalized.length; offset += blockPeriod) {
    const block = normalized.slice(offset, offset + blockPeriod);
    const merged: number[] = [];
    for (const char of block) {
      const index = positions.get(char)!;
      merged.push(Math.floor(index / 5), index % 5);
    }
    const midpoint = block.length;
    const rows = merged.slice(0, midpoint);
    const cols = merged.slice(midpoint);
    for (let index = 0; index < block.length; index += 1) {
      output += square[rows[index]! * 5 + cols[index]!]!;
    }
  }

  return output;
}
