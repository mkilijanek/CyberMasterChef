import type { Operation } from "@cybermasterchef/core";

export const removeCarets: Operation = {
  id: "text.removeCarets",
  name: "Remove Carets",
  description: "Removes caret characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\^+/gu, "") };
  }
};
