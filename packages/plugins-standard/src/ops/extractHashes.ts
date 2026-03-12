import type { Operation } from "@cybermasterchef/core";

const HASH_REGEX = /\b(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64}|[a-f0-9]{128})\b/gi;

export const extractHashes: Operation = {
  id: "crypto.extractHashes",
  name: "Extract Hashes",
  description: "Extracts unique hex digest values from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(HASH_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
