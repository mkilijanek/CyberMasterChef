import type { Operation } from "@cybermasterchef/core";

const HEX_RE = /^[0-9a-f]+$/i;

type HashAnalysis = {
  inputLength: number;
  isHex: boolean;
  candidates: string[];
};

function analyseHashValue(value: string): HashAnalysis {
  const trimmed = value.trim();
  const isHex = HEX_RE.test(trimmed);
  const candidates: string[] = [];
  if (isHex) {
    switch (trimmed.length) {
      case 32:
        candidates.push("md5");
        break;
      case 40:
        candidates.push("sha1");
        break;
      case 56:
        candidates.push("sha224");
        break;
      case 64:
        candidates.push("sha256");
        break;
      case 96:
        candidates.push("sha384");
        break;
      case 128:
        candidates.push("sha512");
        break;
      default:
        break;
    }
  }
  return {
    inputLength: trimmed.length,
    isHex,
    candidates
  };
}

export const analyseHash: Operation = {
  id: "hash.analyseHash",
  name: "Analyse Hash",
  description: "Guesses hash type based on input length and character set.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "json", value: analyseHashValue(input.value) };
  }
};
