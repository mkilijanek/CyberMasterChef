import type { DataValue, Recipe } from "./types.js";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (value && typeof value === "object") {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(src).sort()) {
      out[key] = canonicalize(src[key]);
    }
    return out;
  }
  return value;
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("WebCrypto subtle API is not available");
  }
  const src = bytes.buffer;
  const buffer =
    src instanceof ArrayBuffer
      ? src.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      : Uint8Array.from(bytes).buffer;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(digest));
}

export function canonicalizeRecipe(recipe: Recipe): string {
  return JSON.stringify(canonicalize(recipe));
}

export async function hashRecipe(recipe: Recipe): Promise<string> {
  return await sha256Hex(encodeUtf8(canonicalizeRecipe(recipe)));
}

export function canonicalizeDataValue(input: DataValue): string {
  if (input.type === "bytes") {
    return JSON.stringify({
      type: input.type,
      valueHex: bytesToHex(input.value)
    });
  }
  return JSON.stringify(canonicalize(input));
}

export async function hashDataValue(input: DataValue): Promise<string> {
  return await sha256Hex(encodeUtf8(canonicalizeDataValue(input)));
}
