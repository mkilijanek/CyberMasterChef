import type { Operation } from "@cybermasterchef/core";

export const removeSpaces: Operation = {
  id: "text.removeSpaces",
  name: "Remove Spaces",
  description: "Removes all whitespace characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\s+/gu, "") };
  }
};
