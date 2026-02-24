import type { Operation } from "@cybermasterchef/core";

export const tabsToSingleSpace: Operation = {
  id: "text.tabsToSingleSpace",
  name: "Tabs To Single Space",
  description: "Replaces tabs with a single space.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\t/gu, " ") };
  }
};
