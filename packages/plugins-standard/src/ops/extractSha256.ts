import type { Operation } from "@cybermasterchef/core";

const SHA256_REGEX = /\b[a-f0-9]{64}\b/gi;

export const extractSha256: Operation = {
  id: "forensic.extractSha256",
  name: "Extract SHA-256",
  description: "Extracts unique SHA-256 hashes from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(SHA256_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
