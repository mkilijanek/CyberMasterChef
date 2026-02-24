import type { Operation } from "@cybermasterchef/core";

export const toSnakeCase: Operation = {
  id: "text.toSnakeCase",
  name: "Snake Case",
  description: "Converts text to snake_case.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value
      .toLowerCase()
      .split(/[^a-z0-9]+/u)
      .filter((w) => w.length > 0);
    return { type: "string", value: words.join("_") };
  }
};
