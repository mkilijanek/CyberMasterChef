import type { Operation } from "@cybermasterchef/core";

export const jsonMinify: Operation = {
  id: "format.jsonMinify",
  name: "JSON Minify",
  description: "Minifies valid JSON string payload.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    try {
      const parsed = JSON.parse(input.value) as unknown;
      return { type: "string", value: JSON.stringify(parsed) };
    } catch {
      throw new Error("Invalid JSON input");
    }
  }
};
