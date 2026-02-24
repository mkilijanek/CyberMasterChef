import type { Operation } from "@cybermasterchef/core";

export const swapCase: Operation = {
  id: "text.swapCase",
  name: "Swap Case",
  description: "Swaps letter casing in text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return {
      type: "string",
      value: [...input.value]
        .map((ch) => (ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()))
        .join("")
    };
  }
};
