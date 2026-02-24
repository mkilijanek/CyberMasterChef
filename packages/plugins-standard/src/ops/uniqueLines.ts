import type { Operation } from "@cybermasterchef/core";

export const uniqueLines: Operation = {
  id: "text.uniqueLines",
  name: "Unique Lines",
  description: "Deduplicates lines preserving first occurrence.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const out: string[] = [];
    const seen = new Set<string>();
    for (const line of input.value.split(/\r?\n/u)) {
      if (seen.has(line)) continue;
      seen.add(line);
      out.push(line);
    }
    return { type: "string", value: out.join("\n") };
  }
};
