import type { Operation } from "@cybermasterchef/core";

export const removeAtSigns: Operation = {
  id: "text.removeAtSigns",
  name: "Remove At Signs",
  description: "Removes at-sign characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/@+/gu, "") };
  }
};
