import type { Operation } from "@cybermasterchef/core";

export const linesTrimRight: Operation = {
  id: "text.linesTrimRight",
  name: "Lines Trim Right",
  description: "Trims right whitespace in each line.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).map((l) => l.replace(/\s+$/u, "")).join("\n") };
  }
};
