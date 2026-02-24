import type { Operation } from "@cybermasterchef/core";

export const removePunctuation: Operation = {
  id: "text.removePunctuation",
  name: "Remove Punctuation",
  description: "Removes basic punctuation characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[.,!?;:'"()\[\]{}<>\-]/gu, "") };
  }
};
