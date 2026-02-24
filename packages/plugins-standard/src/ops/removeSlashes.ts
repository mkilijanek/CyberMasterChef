import type { Operation } from "@cybermasterchef/core";

export const removeSlashes: Operation = {
  id: "text.removeSlashes",
  name: "Remove Slashes",
  description: "Removes forward slashes.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\/+?/gu, "") };
  }
};
