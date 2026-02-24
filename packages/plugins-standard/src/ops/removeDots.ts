import type { Operation } from "@cybermasterchef/core";

export const removeDots: Operation = {
  id: "text.removeDots",
  name: "Remove Dots",
  description: "Removes dots.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\.+/gu, "") };
  }
};
