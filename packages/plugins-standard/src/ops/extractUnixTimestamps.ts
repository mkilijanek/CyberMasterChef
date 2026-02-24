import type { Operation } from "@cybermasterchef/core";

const UNIX_TS_REGEX = /\b\d{10,13}\b/g;

export const extractUnixTimestamps: Operation = {
  id: "date.extractUnixTimestamps",
  name: "Extract Unix Timestamps",
  description: "Extracts unique 10 or 13 digit Unix timestamp candidates from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(UNIX_TS_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) {
      if (match.length === 10 || match.length === 13) unique.add(match);
    }
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
