import type { Operation } from "@cybermasterchef/core";

export const removeBlankLines: Operation = {
  id: "text.removeBlankLines",
  name: "Remove Blank Lines",
  description: "Removes empty or whitespace-only lines.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const lines = input.value
      .split(/\r?\n/u)
      .filter((line) => line.trim().length > 0);
    return { type: "string", value: lines.join("\n") };
  }
};
