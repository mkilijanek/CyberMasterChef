import type { Operation } from "@cybermasterchef/core";

const SHA512_REGEX = /\b[a-f0-9]{128}\b/gi;

export const extractSha512: Operation = {
  id: "forensic.extractSha512",
  name: "Extract SHA-512",
  description: "Extracts unique SHA-512 hashes from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(SHA512_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
