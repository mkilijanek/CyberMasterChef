import type { Operation } from "@cybermasterchef/core";

export const trimEnd: Operation = {
  id: "text.trimEnd",
  name: "Trim End",
  description: "Trims trailing whitespace.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.trimEnd() };
  }
};
