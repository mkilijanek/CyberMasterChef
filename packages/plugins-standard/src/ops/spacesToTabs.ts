import type { Operation } from "@cybermasterchef/core";

export const spacesToTabs: Operation = {
  id: "text.spacesToTabs",
  name: "Spaces To Tabs",
  description: "Replaces double spaces with tabs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/  /gu, "\t") };
  }
};
