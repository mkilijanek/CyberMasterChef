import type { Operation } from "@cybermasterchef/core";

export const countSemicolons: Operation = {
  id: "text.countSemicolons",
  name: "Count Semicolons",
  description: "Counts semicolons.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/;/g); return { type: "number", value: m ? m.length : 0 };
  }
};
