import type { Operation } from "@cybermasterchef/core";

export const reverseWords: Operation = {
  id: "text.reverseWords",
  name: "Reverse Words",
  description: "Reverses word order using whitespace splitting.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.trim().split(/\s+/u).filter((w) => w.length > 0);\n    return { type: "string", value: words.reverse().join(" ") };
  }
};
