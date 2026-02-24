import type { Operation } from "@cybermasterchef/core";

export const removeHyphens: Operation = {
  id: "text.removeHyphens",
  name: "Remove Hyphens",
  description: "Removes hyphen characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/-+/gu, "") };
  }
};
