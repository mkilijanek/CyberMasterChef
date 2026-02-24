import type { Operation } from "@cybermasterchef/core";

export const trimQuotes: Operation = {
  id: "text.trimQuotes",
  name: "Trim Quotes",
  description: "Trims single and double quotes from both ends.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/^["']+|["']+$/gu, "") };
  }
};
