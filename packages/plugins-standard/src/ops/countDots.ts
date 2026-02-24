import type { Operation } from "@cybermasterchef/core";

export const countDots: Operation = {
  id: "text.countDots",
  name: "Count Dots",
  description: "Counts dot characters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/\./g); return { type: "number", value: m ? m.length : 0 };
  }
};
