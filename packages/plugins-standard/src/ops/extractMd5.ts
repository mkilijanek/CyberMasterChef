import type { Operation } from "@cybermasterchef/core";

const MD5_REGEX = /\b[a-f0-9]{32}\b/gi;

export const extractMd5: Operation = {
  id: "forensic.extractMd5",
  name: "Extract MD5",
  description: "Extracts unique MD5 hashes from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(MD5_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match.toLowerCase());
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
