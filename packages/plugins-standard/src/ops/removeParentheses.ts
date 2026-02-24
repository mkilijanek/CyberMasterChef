import type { Operation } from "@cybermasterchef/core";

export const removeParentheses: Operation = {
  id: "text.removeParentheses",
  name: "Remove Parentheses",
  description: "Removes parentheses.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[()]+/gu, "") };
  }
};
