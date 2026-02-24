import type { Operation } from "@cybermasterchef/core";

export const removeSingleQuotes: Operation = {
  id: "text.removeSingleQuotes",
  name: "Remove Single Quotes",
  description: "Removes single quote characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/'+/gu, "") };
  }
};
