import type { Operation } from "@cybermasterchef/core";

export const removeCurrencySymbols: Operation = {
  id: "text.removeCurrencySymbols",
  name: "Remove Currency Symbols",
  description: "Removes common ASCII currency symbols.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[$]/gu, "") };
  }
};
