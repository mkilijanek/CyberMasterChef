import type { Operation } from "@cybermasterchef/core";

export const countLowercase: Operation = {
  id: "text.countLowercase",
  name: "Count Lowercase",
  description: "Counts lowercase ASCII letters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/[a-z]/g); return { type: "number", value: m ? m.length : 0 };
  }
};
