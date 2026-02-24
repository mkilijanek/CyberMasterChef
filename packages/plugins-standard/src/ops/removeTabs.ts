import type { Operation } from "@cybermasterchef/core";

export const removeTabs: Operation = {
  id: "text.removeTabs",
  name: "Remove Tabs",
  description: "Removes tab characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\t+/gu, "") };
  }
};
