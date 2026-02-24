import type { Operation } from "@cybermasterchef/core";

export const reverse: Operation = {
  id: "text.reverse",
  name: "Reverse",
  description: "Reverses string characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: [...input.value].reverse().join("") };
  }
};
