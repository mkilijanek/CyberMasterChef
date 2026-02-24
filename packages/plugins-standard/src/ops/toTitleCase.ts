import type { Operation } from "@cybermasterchef/core";

export const toTitleCase: Operation = {
  id: "text.toTitleCase",
  name: "Title Case",
  description: "Converts words to title case.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.toLowerCase().split(/(\s+)/u);\n    return { type: "string", value: words.map((w) => /\s+/u.test(w) ? w : (w[0] ? w[0].toUpperCase() + w.slice(1) : w)).join("") };
  }
};
