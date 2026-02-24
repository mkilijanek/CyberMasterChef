import type { Operation } from "@cybermasterchef/core";

export const linesToWords: Operation = {
  id: "text.linesToWords",
  name: "Lines To Words",
  description: "Converts lines to space-separated words.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).map((line) => line.trim()).filter((line) => line.length > 0).join(" ") };
  }
};
