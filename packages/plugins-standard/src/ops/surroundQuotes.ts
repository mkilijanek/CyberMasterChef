import type { Operation } from "@cybermasterchef/core";

export const surroundQuotes: Operation = {
  id: "text.surroundQuotes",
  name: "Surround Quotes",
  description: "Surrounds text with double quotes.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: '"' + input.value + '"' };
  }
};
