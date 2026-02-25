import type { Operation } from "@cybermasterchef/core";

const BACON_TABLE = [
  "AAAAA",
  "AAAAB",
  "AAABA",
  "AAABB",
  "AABAA",
  "AABAB",
  "AABBA",
  "AABBB",
  "ABAAA",
  "ABAAB",
  "ABABA",
  "ABABB",
  "ABBAA",
  "ABBAB",
  "ABBBA",
  "ABBBB",
  "BAAAA",
  "BAAAB",
  "BAABA",
  "BAABB",
  "BABAA",
  "BABAB",
  "BABBA",
  "BABBB",
  "BBAAA",
  "BBAAB"
];

function encodeChar(char: string): string | null {
  const code = char.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return null;
  return BACON_TABLE[code - 65] ?? null;
}

export const baconCipherEncode: Operation = {
  id: "crypto.baconCipherEncode",
  name: "Bacon Cipher Encode",
  description: "Encodes letters into Bacon's cipher (A/B).",
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
