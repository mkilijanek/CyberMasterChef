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
    const out: string[] = [];\n    const seen = new Set<string>();\n    for (const line of input.value.split(/\r?\n/u)) {\n      if (seen.has(line)) continue;\n      seen.add(line);\n      out.push(line);\n    }\n    return { type: "string", value: out.join("\n") };
  }
};
