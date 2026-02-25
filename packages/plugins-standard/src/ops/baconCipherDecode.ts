import type { Operation } from "@cybermasterchef/core";

const BACON_TABLE = new Map(
  [
    ["AAAAA", "A"],
    ["AAAAB", "B"],
    ["AAABA", "C"],
    ["AAABB", "D"],
    ["AABAA", "E"],
    ["AABAB", "F"],
    ["AABBA", "G"],
    ["AABBB", "H"],
    ["ABAAA", "I"],
    ["ABAAB", "J"],
    ["ABABA", "K"],
    ["ABABB", "L"],
    ["ABBAA", "M"],
    ["ABBAB", "N"],
    ["ABBBA", "O"],
    ["ABBBB", "P"],
    ["BAAAA", "Q"],
    ["BAAAB", "R"],
    ["BAABA", "S"],
    ["BAABB", "T"],
    ["BABAA", "U"],
    ["BABAB", "V"],
    ["BABBA", "W"],
    ["BABBB", "X"],
    ["BBAAA", "Y"],
    ["BBAAB", "Z"]
  ]
);

function normalizeBits(raw: string): string {
  return raw.replace(/[^ABab]/g, "").toUpperCase();
}

export const baconCipherDecode: Operation = {
  id: "crypto.baconCipherDecode",
  name: "Bacon Cipher Decode",
  description: "Decodes Bacon's cipher (A/B) into letters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const cleaned = normalizeBits(input.value);
    if (cleaned.length === 0) return { type: "string", value: "" };
    if (cleaned.length % 5 !== 0) {
      throw new Error("Bacon cipher input length must be multiple of 5");
    }
    const out: string[] = [];
    for (let i = 0; i < cleaned.length; i += 5) {
      const chunk = cleaned.slice(i, i + 5);
      const decoded = BACON_TABLE.get(chunk);
      if (!decoded) {
        throw new Error(`Invalid Bacon cipher chunk: ${chunk}`);
      }
      out.push(decoded);
    }
    return { type: "string", value: out.join("") };
  }
};
