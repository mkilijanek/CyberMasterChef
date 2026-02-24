import type { Operation } from "@cybermasterchef/core";

export const surroundBrackets: Operation = {
  id: "text.surroundBrackets",
  name: "Surround Brackets",
  description: "Surrounds text with square brackets.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: "[" + input.value + "]" };
  }
};
