import type { Operation } from "@cybermasterchef/core";

export const removeBackslashes: Operation = {
  id: "text.removeBackslashes",
  name: "Remove Backslashes",
  description: "Removes backslashes.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\\+/gu, "") };
  }
};
