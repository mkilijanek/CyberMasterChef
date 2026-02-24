import type { Operation } from "@cybermasterchef/core";

export const linesToCsv: Operation = {
  id: "text.linesToCsv",
  name: "Lines To CSV",
  description: "Converts lines into comma-separated values.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).map((line) => line.trim()).filter((line) => line.length > 0).join(",") };
  }
};
