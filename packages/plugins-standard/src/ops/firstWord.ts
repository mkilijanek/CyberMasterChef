import type { Operation } from "@cybermasterchef/core";

export const firstWord: Operation = {
  id: "text.firstWord",
  name: "First Word",
  description: "Returns the first whitespace-separated word.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.trim().split(/\s+/u).filter((w) => w.length > 0); return { type: "string", value: words[0] ?? "" };
  }
};
