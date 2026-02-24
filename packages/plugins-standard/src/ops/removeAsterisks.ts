import type { Operation } from "@cybermasterchef/core";

export const removeAsterisks: Operation = {
  id: "text.removeAsterisks",
  name: "Remove Asterisks",
  description: "Removes asterisk characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\*+/gu, "") };
  }
};
