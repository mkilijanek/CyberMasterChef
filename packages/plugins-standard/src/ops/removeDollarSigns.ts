import type { Operation } from "@cybermasterchef/core";

export const removeDollarSigns: Operation = {
  id: "text.removeDollarSigns",
  name: "Remove Dollar Signs",
  description: "Removes dollar signs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\$+/gu, "") };
  }
};
