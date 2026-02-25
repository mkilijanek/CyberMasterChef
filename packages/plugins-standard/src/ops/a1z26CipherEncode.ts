import type { Operation } from "@cybermasterchef/core";

function encodeChar(char: string): string | null {
  const code = char.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return null;
  return String(code - 64);
}

export const a1z26CipherEncode: Operation = {
  id: "crypto.a1z26CipherEncode",
  name: "A1Z26 Cipher Encode",
  description: "Encodes letters to numbers (A=1..Z=26).",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: " "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : " ";
    const parts = [...input.value]
      .map(encodeChar)
      .filter((val): val is string => val !== null);
    return { type: "string", value: parts.join(delimiter) };
  }
};
