import type { Operation } from "@cybermasterchef/core";

export const normalizeWhitespace: Operation = {
  id: "text.normalizeWhitespace",
  name: "Normalize Whitespace",
  description: "Collapses whitespace runs and trims text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\s+/gu, " ").trim() };
  }
};
