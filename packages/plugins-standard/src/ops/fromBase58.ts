import type { Operation } from "@cybermasterchef/core";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_MAP = new Map(
  BASE58_ALPHABET.split("").map((char, index) => [char, index])
);

function decodeBase58(value: string): Uint8Array {
  const trimmed = value.trim();
  if (!trimmed) return new Uint8Array();

  const bytes: number[] = [0];
  for (const char of trimmed) {
    const digit = BASE58_MAP.get(char);
    if (digit === undefined) {
      throw new Error(`Invalid Base58 character: ${char}`);
    }
    let carry = digit;
    for (let i = 0; i < bytes.length; i++) {
      carry += (bytes[i] ?? 0) * 58;
      bytes[i] = carry & 0xff;
      carry = Math.floor(carry / 256);
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry = Math.floor(carry / 256);
    }
  }

  let leadingZeros = 0;
  for (const char of trimmed) {
    if (char !== "1") break;
    leadingZeros++;
  }
  const out = new Uint8Array(leadingZeros + bytes.length);
  out.set(bytes.reverse(), leadingZeros);
  return out;
}

export const fromBase58: Operation = {
  id: "codec.fromBase58",
  name: "From Base58",
  description: "Decodes Base58 string (Bitcoin alphabet) into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBase58(input.value) };
  }
};
