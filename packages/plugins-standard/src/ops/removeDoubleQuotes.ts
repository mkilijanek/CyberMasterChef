import type { Operation } from "@cybermasterchef/core";

export const removeDoubleQuotes: Operation = {
  id: "text.removeDoubleQuotes",
  name: "Remove Double Quotes",
  description: "Removes double quote characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/"+/gu, "") };
  }
};
