import type { Operation } from "@cybermasterchef/core";

export const removePercents: Operation = {
  id: "text.removePercents",
  name: "Remove Percents",
  description: "Removes percent signs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/%+/gu, "") };
  }
};
