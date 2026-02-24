import type { Operation } from "@cybermasterchef/core";

export const sortLines: Operation = {
  id: "text.sortLines",
  name: "Sort Lines",
  description: "Sorts lines lexicographically.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).sort((a, b) => a.localeCompare(b)).join("\n") };
  }
};
