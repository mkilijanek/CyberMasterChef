import type { Operation } from "@cybermasterchef/core";

export const removePluses: Operation = {
  id: "text.removePluses",
  name: "Remove Pluses",
  description: "Removes plus signs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\++/gu, "") };
  }
};
