import type { Operation } from "@cybermasterchef/core";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += (digits[i] ?? 0) * 256;
      digits[i] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte !== 0) break;
    leadingZeros++;
  }
  const prefix = "1".repeat(leadingZeros);
  const body = digits
    .slice()
    .reverse()
    .map((digit) => BASE58_ALPHABET[digit] ?? "")
    .join("");
  return `${prefix}${body}`;
}

export const toBase58: Operation = {
  id: "codec.toBase58",
  name: "To Base58",
  description: "Encodes bytes or string to Base58 (Bitcoin alphabet).",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBase58(bytes) };
  }
};
