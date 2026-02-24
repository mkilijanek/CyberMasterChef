import type { Operation } from "@cybermasterchef/core";

export const trim: Operation = {
  id: "text.trim",
  name: "Trim",
  description: "Trims leading and trailing whitespace.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.trim() };
  }
};
