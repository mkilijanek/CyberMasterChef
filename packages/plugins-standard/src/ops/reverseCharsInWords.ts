import type { Operation } from "@cybermasterchef/core";

export const reverseCharsInWords: Operation = {
  id: "text.reverseCharsInWords",
  name: "Reverse Chars In Words",
  description: "Reverses characters in each whitespace-separated word.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/(\s+)/u).map((chunk) => /\s+/u.test(chunk) ? chunk : [...chunk].reverse().join("")).join("") };
  }
};
