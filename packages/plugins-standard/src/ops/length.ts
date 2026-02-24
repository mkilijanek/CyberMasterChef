import type { Operation } from "@cybermasterchef/core";

export const length: Operation = {
  id: "text.length",
  name: "Length",
  description: "Returns text length in characters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "number", value: [...input.value].length };
  }
};
