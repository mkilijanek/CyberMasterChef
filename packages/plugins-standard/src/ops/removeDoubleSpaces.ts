import type { Operation } from "@cybermasterchef/core";

export const removeDoubleSpaces: Operation = {
  id: "text.removeDoubleSpaces",
  name: "Remove Double Spaces",
  description: "Replaces runs of spaces with single space.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/ {2,}/gu, " ") };
  }
};
