import type { Operation } from "@cybermasterchef/core";

export const removeUnderscores: Operation = {
  id: "text.removeUnderscores",
  name: "Remove Underscores",
  description: "Removes underscore characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/_+/gu, "") };
  }
};
