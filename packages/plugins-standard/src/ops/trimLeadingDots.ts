import type { Operation } from "@cybermasterchef/core";

export const trimLeadingDots: Operation = {
  id: "text.trimLeadingDots",
  name: "Trim Leading Dots",
  description: "Trims leading dots.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/^\.+/u, "") };
  }
};
