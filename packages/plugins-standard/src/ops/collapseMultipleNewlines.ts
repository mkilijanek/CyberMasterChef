import type { Operation } from "@cybermasterchef/core";

export const collapseMultipleNewlines: Operation = {
  id: "text.collapseMultipleNewlines",
  name: "Collapse Multiple Newlines",
  description: "Collapses multiple blank lines to one newline.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\n{2,}/gu, "\n") };
  }
};
