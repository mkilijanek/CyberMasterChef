import type { DataValue } from "@cybermasterchef/core";

function normalizeSlice(start: number, length: number, totalLength: number): [number, number] {
  let normalizedStart = start;
  let normalizedLength = length;

  if (normalizedStart < 0) {
    normalizedStart = totalLength + normalizedStart;
  }

  if (normalizedLength < 0) {
    normalizedStart += normalizedLength;
    if (normalizedStart < 0) {
      normalizedStart = totalLength + normalizedStart;
      normalizedLength = normalizedStart - normalizedLength;
    } else {
      normalizedLength = -normalizedLength;
    }
  }

  return [normalizedStart, normalizedLength];
}

export function toBytes(input: DataValue): Uint8Array {
  if (input.type === "bytes") return input.value;
  if (input.type === "string") return new TextEncoder().encode(input.value);
  throw new Error("Expected bytes or string input");
}

export function splitLines(bytes: Uint8Array): Uint8Array[] {
  const lines: Uint8Array[] = [];
  let start = 0;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x0a) {
      lines.push(bytes.slice(start, i));
      start = i + 1;
    }
  }

  lines.push(bytes.slice(start));
  return lines;
}

export function joinLines(lines: Uint8Array[]): Uint8Array {
  if (lines.length === 0) return new Uint8Array();
  const totalLength = lines.reduce((sum, line) => sum + line.length, lines.length - 1);
  const out = new Uint8Array(totalLength);
  let offset = 0;

  lines.forEach((line, index) => {
    out.set(line, offset);
    offset += line.length;
    if (index < lines.length - 1) {
      out[offset] = 0x0a;
      offset += 1;
    }
  });

  return out;
}

export function dropByteRange(bytes: Uint8Array, start: number, length: number): Uint8Array {
  const [normalizedStart, normalizedLength] = normalizeSlice(start, length, bytes.length);
  const left = bytes.slice(0, normalizedStart);
  const right = bytes.slice(normalizedStart + normalizedLength);
  const out = new Uint8Array(left.length + right.length);
  out.set(left, 0);
  out.set(right, left.length);
  return out;
}

export function takeByteRange(bytes: Uint8Array, start: number, length: number): Uint8Array {
  const [normalizedStart, normalizedLength] = normalizeSlice(start, length, bytes.length);
  return bytes.slice(normalizedStart, normalizedStart + normalizedLength);
}

export function dropNth(bytes: Uint8Array, every: number, startingAt: number): Uint8Array {
  if (!Number.isInteger(every) || every <= 0) {
    throw new Error("'Drop every' must be a positive integer.");
  }
  if (!Number.isInteger(startingAt) || startingAt < 0) {
    throw new Error("'Starting at' must be a positive or zero integer.");
  }
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    if (i < startingAt || (i - startingAt) % every !== 0) {
      out.push(bytes[i]!);
    }
  }
  return Uint8Array.from(out);
}

export function takeNth(bytes: Uint8Array, every: number, startingAt: number): Uint8Array {
  if (!Number.isInteger(every) || every <= 0) {
    throw new Error("'Take every' must be a positive integer.");
  }
  if (!Number.isInteger(startingAt) || startingAt < 0) {
    throw new Error("'Starting at' must be a positive or zero integer.");
  }
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    if (i >= startingAt && (i - startingAt) % every === 0) {
      out.push(bytes[i]!);
    }
  }
  return Uint8Array.from(out);
}
