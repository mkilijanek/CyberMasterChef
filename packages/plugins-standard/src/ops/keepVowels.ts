import type { Operation } from "@cybermasterchef/core";

export const keepVowels: Operation = {
  id: "text.keepVowels",
  name: "Keep Vowels",
  description: "Keeps English vowels only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^aeiou]/giu, "") };
  }
};
