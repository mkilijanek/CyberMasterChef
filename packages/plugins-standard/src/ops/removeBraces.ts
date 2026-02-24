import type { Operation } from "@cybermasterchef/core";

export const removeBraces: Operation = {
  id: "text.removeBraces",
  name: "Remove Braces",
  description: "Removes curly braces.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[{}]+/gu, "") };
  }
};
