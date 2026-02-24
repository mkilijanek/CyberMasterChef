import type { Operation } from "@cybermasterchef/core";

const JWT_REGEX = /\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

export const extractJwt: Operation = {
  id: "forensic.extractJwt",
  name: "Extract JWT",
  description: "Extracts unique JWT token candidates from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(JWT_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match);
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};
