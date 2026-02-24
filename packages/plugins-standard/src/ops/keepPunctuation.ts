import type { Operation } from "@cybermasterchef/core";

export const keepPunctuation: Operation = {
  id: "text.keepPunctuation",
  name: "Keep Punctuation",
  description: "Keeps basic punctuation characters only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^.,!?;:'"()\[\]{}<>\-]/gu, "") };
  }
};
