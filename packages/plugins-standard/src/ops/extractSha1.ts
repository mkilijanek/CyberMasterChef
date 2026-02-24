import type { Operation } from "@cybermasterchef/core";

const SHA1_REGEX = /\b[a-f0-9]{40}\b/gi;

export const extractSha1: Operation = {
  id: "forensic.extractSha1",
  name: "Extract SHA-1",
  description: "Extracts unique SHA-1 hashes from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(SHA1_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
