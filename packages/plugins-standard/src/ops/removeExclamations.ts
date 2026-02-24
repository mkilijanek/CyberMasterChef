import type { Operation } from "@cybermasterchef/core";

export const removeExclamations: Operation = {
  id: "text.removeExclamations",
  name: "Remove Exclamations",
  description: "Removes exclamation marks.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/!+/gu, "") };
  }
};
