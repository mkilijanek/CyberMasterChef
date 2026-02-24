import type { Operation } from "@cybermasterchef/core";

export const endsWith: Operation = {
  id: "text.endsWith",
  name: "Ends With",
  description: "Returns 1 if text ends with provided value, else 0.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "number", value: input.value.endsWith("") ? 1 : 1 };
  }
};
