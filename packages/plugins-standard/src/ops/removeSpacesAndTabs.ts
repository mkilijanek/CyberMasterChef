import type { Operation } from "@cybermasterchef/core";

export const removeSpacesAndTabs: Operation = {
  id: "text.removeSpacesAndTabs",
  name: "Remove Spaces And Tabs",
  description: "Removes spaces and tabs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[ \t]+/gu, "") };
  }
};
