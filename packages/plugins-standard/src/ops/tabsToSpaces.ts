import type { Operation } from "@cybermasterchef/core";

export const tabsToSpaces: Operation = {
  id: "text.tabsToSpaces",
  name: "Tabs To Spaces",
  description: "Replaces tabs with two spaces.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\t/gu, "  ") };
  }
};
