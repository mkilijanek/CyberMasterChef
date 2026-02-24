import type { Operation } from "@cybermasterchef/core";

export const removeBackticks: Operation = {
  id: "text.removeBackticks",
  name: "Remove Backticks",
  description: "Removes backticks.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\x60+/gu, "") };
  }
};
