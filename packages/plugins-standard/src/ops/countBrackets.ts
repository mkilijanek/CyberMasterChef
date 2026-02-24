import type { Operation } from "@cybermasterchef/core";

export const countBrackets: Operation = {
  id: "text.countBrackets",
  name: "Count Brackets",
  description: "Counts square brackets.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/[\[\]]/g); return { type: "number", value: m ? m.length : 0 };
  }
};
