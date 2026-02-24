import type { Operation } from "@cybermasterchef/core";

export const countQuotes: Operation = {
  id: "text.countQuotes",
  name: "Count Quotes",
  description: "Counts single and double quotes.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/["']/g); return { type: "number", value: m ? m.length : 0 };
  }
};
