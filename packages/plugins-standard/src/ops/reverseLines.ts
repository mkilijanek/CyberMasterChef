import type { Operation } from "@cybermasterchef/core";

export const reverseLines: Operation = {
  id: "text.reverseLines",
  name: "Reverse Lines",
  description: "Reverses line order.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).reverse().join("\n") };
  }
};
