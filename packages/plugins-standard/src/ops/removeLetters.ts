import type { Operation } from "@cybermasterchef/core";

export const removeLetters: Operation = {
  id: "text.removeLetters",
  name: "Remove Letters",
  description: "Removes ASCII letters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[A-Za-z]+/gu, "") };
  }
};
