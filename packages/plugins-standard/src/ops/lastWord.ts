import type { Operation } from "@cybermasterchef/core";

export const lastWord: Operation = {
  id: "text.lastWord",
  name: "Last Word",
  description: "Returns the last whitespace-separated word.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.trim().split(/\s+/u).filter((w) => w.length > 0); return { type: "string", value: words[words.length - 1] ?? "" };
  }
};
