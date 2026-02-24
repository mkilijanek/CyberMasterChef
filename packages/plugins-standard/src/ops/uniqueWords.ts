import type { Operation } from "@cybermasterchef/core";

export const uniqueWords: Operation = {
  id: "text.uniqueWords",
  name: "Unique Words",
  description: "Deduplicates words preserving first occurrence.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const out: string[] = [];
    const seen = new Set<string>();
    for (const word of input.value.trim().split(/\s+/u).filter((w) => w.length > 0)) {
      if (seen.has(word)) continue;
      seen.add(word);
      out.push(word);
    }
    return { type: "string", value: out.join(" ") };
  }
};
