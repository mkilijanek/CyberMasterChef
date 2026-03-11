import type { Operation } from "@cybermasterchef/core";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encodeBase32(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";

  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f] ?? "";
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f] ?? "";
  }
  while (out.length % 8 !== 0) {
    out += "=";
  }
  return out;
}

export const toBase32: Operation = {
  id: "codec.toBase32",
  name: "To Base32",
  description: "Encodes bytes or string to RFC 4648 Base32.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBase32(bytes) };
  }
};
