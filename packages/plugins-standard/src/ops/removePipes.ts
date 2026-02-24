import type { Operation } from "@cybermasterchef/core";

export const removePipes: Operation = {
  id: "text.removePipes",
  name: "Remove Pipes",
  description: "Removes vertical bars.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\|+/gu, "") };
  }
};
