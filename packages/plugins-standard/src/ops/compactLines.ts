import type { Operation } from "@cybermasterchef/core";

export const compactLines: Operation = {
  id: "text.compactLines",
  name: "Compact Lines",
  description: "Joins non-empty trimmed lines with spaces.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.split(/\r?\n/u).map((line) => line.trim()).filter((line) => line.length > 0);\n    return { type: "string", value: words.join(" ") };
  }
};
