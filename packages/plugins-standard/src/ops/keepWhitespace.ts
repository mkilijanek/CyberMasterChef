import type { Operation } from "@cybermasterchef/core";

export const keepWhitespace: Operation = {
  id: "text.keepWhitespace",
  name: "Keep Whitespace",
  description: "Keeps whitespace characters only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^\s]+/gu, "") };
  }
};
