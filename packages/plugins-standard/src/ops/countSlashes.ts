import type { Operation } from "@cybermasterchef/core";

export const countSlashes: Operation = {
  id: "text.countSlashes",
  name: "Count Slashes",
  description: "Counts forward slashes.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/\//g); return { type: "number", value: m ? m.length : 0 };
  }
};
