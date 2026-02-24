import type { Operation } from "@cybermasterchef/core";

export const collapseUnderscores: Operation = {
  id: "text.collapseUnderscores",
  name: "Collapse Underscores",
  description: "Collapses repeated underscores to one.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/_+/gu, "_") };
  }
};
