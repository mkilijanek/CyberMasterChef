import type { Operation } from "@cybermasterchef/core";

export const wordCount: Operation = {
  id: "text.wordCount",
  name: "Word Count",
  description: "Counts words separated by whitespace.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const trimmed = input.value.trim();
    if (trimmed.length === 0) return { type: "number", value: 0 };
    return { type: "number", value: trimmed.split(/\s+/u).length };
  }
};
