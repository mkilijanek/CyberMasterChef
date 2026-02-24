import type { Operation } from "@cybermasterchef/core";

export const removeControlChars: Operation = {
  id: "text.removeControlChars",
  name: "Remove Control Chars",
  description: "Removes control characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[\x00-\x1F\x7F]+/gu, "") };
  }
};
