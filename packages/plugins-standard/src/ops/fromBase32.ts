import type { Operation } from "@cybermasterchef/core";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE32_MAP = new Map(
  BASE32_ALPHABET.split("").map((char, index) => [char, index])
);

function decodeBase32(input: string): Uint8Array {
  const normalized = input.replace(/\s+/g, "").toUpperCase();
  if (!normalized) return new Uint8Array();
  if (!/^[A-Z2-7]+=*$/.test(normalized)) {
    throw new Error("Invalid Base32 input");
  }

  const trimmed = normalized.replace(/=+$/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of trimmed) {
    const digit = BASE32_MAP.get(char);
    if (digit === undefined) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    value = (value << 5) | digit;
    bits += 5;
    while (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  if (bits > 0 && (value & ((1 << bits) - 1)) !== 0) {
    throw new Error("Invalid Base32 padding");
  }

  return Uint8Array.from(bytes);
}

export const fromBase32: Operation = {
  id: "codec.fromBase32",
  name: "From Base32",
  description: "Decodes RFC 4648 Base32 string into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBase32(input.value) };
  }
};
