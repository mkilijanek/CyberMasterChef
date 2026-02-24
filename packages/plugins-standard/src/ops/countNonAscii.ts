import type { Operation } from "@cybermasterchef/core";

export const countNonAscii: Operation = {
  id: "text.countNonAscii",
  name: "Count Non-ASCII",
  description: "Counts non-ASCII characters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/[^\x00-\x7F]/g); return { type: "number", value: m ? m.length : 0 };
  }
};
