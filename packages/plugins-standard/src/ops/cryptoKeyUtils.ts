import { base64ToBytes, hexToBytes } from "@cybermasterchef/core";

export type ByteEncoding = "utf8" | "hex" | "base64";

export function decodeBytes(value: string, encoding: ByteEncoding): Uint8Array {
  switch (encoding) {
    case "hex":
      return hexToBytes(value);
    case "base64":
      return base64ToBytes(value);
    case "utf8":
    default:
      return new TextEncoder().encode(value);
  }
}

export function normalizeEncoding(value: unknown, fallback: ByteEncoding): ByteEncoding {
  if (value === "hex" || value === "base64" || value === "utf8") {
    return value;
  }
  return fallback;
}
