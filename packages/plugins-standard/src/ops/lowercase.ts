import type { Operation } from "@cybermasterchef/core";

export const lowercase: Operation = {
  id: "text.lowercase",
  name: "Lowercase",
  description: "Converts text to lowercase.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.toLowerCase() };
  }
};
