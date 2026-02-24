import type { Operation } from "@cybermasterchef/core";

export const countUppercase: Operation = {
  id: "text.countUppercase",
  name: "Count Uppercase",
  description: "Counts uppercase ASCII letters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/[A-Z]/g); return { type: "number", value: m ? m.length : 0 };
  }
};
