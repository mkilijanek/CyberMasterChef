import type { Operation } from "@cybermasterchef/core";

export const removeMathSymbols: Operation = {
  id: "text.removeMathSymbols",
  name: "Remove Math Symbols",
  description: "Removes + - * / = symbols.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[+\-*\/=]+/gu, "") };
  }
};
