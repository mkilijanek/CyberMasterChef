import type { Operation } from "@cybermasterchef/core";

export const sortWords: Operation = {
  id: "text.sortWords",
  name: "Sort Words",
  description: "Sorts words lexicographically.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const words = input.value
      .trim()
      .split(/\s+/u)
      .filter((w) => w.length > 0);
    return { type: "string", value: words.sort((a, b) => a.localeCompare(b)).join(" ") };
  }
};
