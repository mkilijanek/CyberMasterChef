import type { Operation } from "@cybermasterchef/core";

export const toPascalCase: Operation = {
  id: "text.toPascalCase",
  name: "Pascal Case",
  description: "Converts text to PascalCase.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value
      .toLowerCase()
      .split(/[^a-z0-9]+/u)
      .filter((w) => w.length > 0);
    return {
      type: "string",
      value: words.map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w)).join("")
    };
  }
};
