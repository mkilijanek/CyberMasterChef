import type { Operation } from "@cybermasterchef/core";

export const countAscii: Operation = {
  id: "text.countAscii",
  name: "Count ASCII",
  description: "Counts ASCII characters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/[\x00-\x7F]/g); return { type: "number", value: m ? m.length : 0 };
  }
};
