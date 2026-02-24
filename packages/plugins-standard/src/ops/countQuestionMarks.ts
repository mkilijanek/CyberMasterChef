import type { Operation } from "@cybermasterchef/core";

export const countQuestionMarks: Operation = {
  id: "text.countQuestionMarks",
  name: "Count Question Marks",
  description: "Counts question marks.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/\?/g); return { type: "number", value: m ? m.length : 0 };
  }
};
