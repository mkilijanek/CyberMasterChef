import type { Operation } from "@cybermasterchef/core";

export const countTabs: Operation = {
  id: "text.countTabs",
  name: "Count Tabs",
  description: "Counts tab characters.",
  input: ["string"],
  output: "number",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const m = input.value.match(/\t/g); return { type: "number", value: m ? m.length : 0 };
  }
};
