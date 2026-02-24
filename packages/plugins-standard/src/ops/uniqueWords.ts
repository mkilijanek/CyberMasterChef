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
    const out: string[] = [];\n    const seen = new Set<string>();\n    for (const word of input.value.trim().split(/\s+/u).filter((w) => w.length > 0)) {\n      if (seen.has(word)) continue;\n      seen.add(word);\n      out.push(word);\n    }\n    return { type: "string", value: out.join(" ") };
  }
};
