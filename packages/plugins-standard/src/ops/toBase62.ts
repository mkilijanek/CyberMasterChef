import type { Operation } from "@cybermasterchef/core";

const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function encodeBase62(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i += 1) {
      carry += (digits[i] ?? 0) * 256;
      digits[i] = carry % 62;
      carry = Math.floor(carry / 62);
    }
    while (carry > 0) {
      digits.push(carry % 62);
      carry = Math.floor(carry / 62);
    }
  }
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte !== 0) break;
    leadingZeros += 1;
  }
  return "0".repeat(leadingZeros) + digits.reverse().map((digit) => BASE62_ALPHABET[digit] ?? "").join("");
}

export const toBase62: Operation = {
  id: "codec.toBase62",
  name: "To Base62",
  description: "Encodes bytes or string to Base62.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBase62(bytes) };
  }
};
