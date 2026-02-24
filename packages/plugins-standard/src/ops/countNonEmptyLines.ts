import type { Operation } from "@cybermasterchef/core";

export const countNonEmptyLines: Operation = {
  id: "text.countNonEmptyLines",
  name: "Count Non-empty Lines",
  description: "Counts non-empty lines.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const c = input.value.split(/\r?\n/u).filter((l) => l.trim().length > 0).length; return { type: "number", value: c };
  }
};
