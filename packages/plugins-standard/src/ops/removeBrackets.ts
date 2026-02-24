import type { Operation } from "@cybermasterchef/core";

export const removeBrackets: Operation = {
  id: "text.removeBrackets",
  name: "Remove Brackets",
  description: "Removes square brackets.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[\[\]]+/gu, "") };
  }
};
