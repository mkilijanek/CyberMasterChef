import type { Operation } from "@cybermasterchef/core";

export const wordsToLines: Operation = {
  id: "text.wordsToLines",
  name: "Words To Lines",
  description: "Converts words to one-word-per-line text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.trim().split(/\s+/u).filter((w) => w.length > 0).join("\n") };
  }
};
