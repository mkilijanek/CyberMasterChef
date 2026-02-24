import type { Operation } from "@cybermasterchef/core";

export const linesNumbered: Operation = {
  id: "text.linesNumbered",
  name: "Lines Numbered",
  description: "Prefixes each line with a 1-based line number.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).map((l, i) => String(i + 1) + ": " + l).join("\n") };
  }
};
