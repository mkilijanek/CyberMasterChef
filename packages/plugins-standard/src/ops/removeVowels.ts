import type { Operation } from "@cybermasterchef/core";

export const removeVowels: Operation = {
  id: "text.removeVowels",
  name: "Remove Vowels",
  description: "Removes English vowels.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[aeiou]/giu, "") };
  }
};
