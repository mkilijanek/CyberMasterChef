import type { Operation } from "@cybermasterchef/core";

export const includesText: Operation = {
  id: "text.includes",
  name: "Includes",
  description: "Returns 1 if text includes non-empty substring, else 0.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const token = input.value.trim(); return { type: "number", value: token.length > 0 && input.value.includes(token) ? 1 : 0 };
  }
};
