import type { Operation } from "@cybermasterchef/core";

export const toKebabCase: Operation = {
  id: "text.toKebabCase",
  name: "Kebab Case",
  description: "Converts text to kebab-case.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.toLowerCase().split(/[^a-z0-9]+/u).filter((w) => w.length > 0);\n    return { type: "string", value: words.join("-") };
  }
};
