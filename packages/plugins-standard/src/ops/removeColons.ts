import type { Operation } from "@cybermasterchef/core";

export const removeColons: Operation = {
  id: "text.removeColons",
  name: "Remove Colons",
  description: "Removes colons.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/:+/gu, "") };
  }
};
