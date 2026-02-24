import type { Operation } from "@cybermasterchef/core";

export const collapseDashes: Operation = {
  id: "text.collapseDashes",
  name: "Collapse Dashes",
  description: "Collapses repeated dashes to one.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/-+/gu, "-") };
  }
};
