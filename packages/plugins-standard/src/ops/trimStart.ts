import type { Operation } from "@cybermasterchef/core";

export const trimStart: Operation = {
  id: "text.trimStart",
  name: "Trim Start",
  description: "Trims leading whitespace.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.trimStart() };
  }
};
