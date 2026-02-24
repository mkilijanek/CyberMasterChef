import type { Operation } from "@cybermasterchef/core";

export const lastLine: Operation = {
  id: "text.lastLine",
  name: "Last Line",
  description: "Returns the last line of text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const lines = input.value.split(/\r?\n/u);
    return { type: "string", value: lines[lines.length - 1] ?? "" };
  }
};
