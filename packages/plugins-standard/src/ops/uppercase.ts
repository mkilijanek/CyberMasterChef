import type { Operation } from "@cybermasterchef/core";

export const uppercase: Operation = {
  id: "text.uppercase",
  name: "Uppercase",
  description: "Converts text to uppercase.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.toUpperCase() };
  }
};
