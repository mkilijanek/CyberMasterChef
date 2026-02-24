import type { Operation } from "@cybermasterchef/core";

export const trimTrailingDots: Operation = {
  id: "text.trimTrailingDots",
  name: "Trim Trailing Dots",
  description: "Trims trailing dots.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\.+$/u, "") };
  }
};
