import type { Operation } from "@cybermasterchef/core";

export const toCamelCase: Operation = {
  id: "text.toCamelCase",
  name: "Camel Case",
  description: "Converts text to camelCase.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value.toLowerCase().split(/[^a-z0-9]+/u).filter((w) => w.length > 0);\n    if (words.length === 0) return { type: "string", value: "" };\n    const head = words[0] ?? "";\n    const tail = words.slice(1).map((w) => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join("");\n    return { type: "string", value: head + tail };
  }
};
