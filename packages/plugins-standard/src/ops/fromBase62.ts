import type { Operation } from "@cybermasterchef/core";

const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62_MAP = new Map(BASE62_ALPHABET.split("").map((char, index) => [char, index]));

function decodeBase62(value: string): Uint8Array {
  const trimmed = value.trim();
  if (!trimmed) return new Uint8Array();

  const bytes: number[] = [0];
  for (const char of trimmed) {
    const digit = BASE62_MAP.get(char);
    if (digit === undefined) {
      throw new Error(`Invalid Base62 character: ${char}`);
    }
    let carry = digit;
    for (let i = 0; i < bytes.length; i += 1) {
      carry += (bytes[i] ?? 0) * 62;
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
    if (char !== "0") break;
    leadingZeros += 1;
  }
  const out = new Uint8Array(leadingZeros + bytes.length);
  out.set(bytes.reverse(), leadingZeros);
  return out;
}

export const fromBase62: Operation = {
  id: "codec.fromBase62",
  name: "From Base62",
  description: "Decodes Base62 string into bytes.",
  input: ["string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "bytes", value: decodeBase62(input.value) };
  }
};
