import type { Operation } from "@cybermasterchef/core";

export const countUnderscores: Operation = {
  id: "text.countUnderscores",
  name: "Count Underscores",
  description: "Counts underscore characters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/_/g); return { type: "number", value: m ? m.length : 0 };
  }
};
