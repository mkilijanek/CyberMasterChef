import type { Operation } from "@cybermasterchef/core";

export const lineCount: Operation = {
  id: "text.lineCount",
  name: "Line Count",
  description: "Counts lines in text.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    if (input.value.length === 0) return { type: "number", value: 0 };
    const lines = input.value.split(/\r?\n/u);
    return { type: "number", value: lines.length };
  }
};
