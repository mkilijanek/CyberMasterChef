import type { DataValue } from "@cybermasterchef/core";

export function inputToBytes(input: DataValue): Uint8Array {
  if (input.type === "bytes") return input.value;
  if (input.type === "string") return new TextEncoder().encode(input.value);
  throw new Error("Expected bytes or string input");
}

export function toAscii(data: Uint8Array): string {
  let out = "";
  for (const byte of data) out += String.fromCharCode(byte);
  return out;
}

export function shannonEntropy(data: Uint8Array): number {
  if (data.length === 0) return 0;
  const freq = new Uint32Array(256);
  for (const byte of data) freq[byte] = (freq[byte] ?? 0) + 1;
  let entropy = 0;
  for (const count of freq) {
    if (count === 0) continue;
    const p = count / data.length;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(4));
}

export function extractPrintableStrings(
  input: string,
  minLength: number,
  maxCount = Number.POSITIVE_INFINITY
): string[] {
  if (!input) return [];
  const effectiveMinLength = Math.max(1, Math.floor(minLength));
  const matches = input.match(/[\x20-\x7E]+/g) ?? [];
  const unique = new Set<string>();
  for (const match of matches) {
    if (match.length < effectiveMinLength) continue;
    unique.add(match);
    if (unique.size >= maxCount) break;
  }
  return Array.from(unique);
}

export async function digestHex(
  algorithm: "SHA-1" | "SHA-256",
  bytes: Uint8Array
): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, Uint8Array.from(bytes));
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0")
  ).join("");
}
