import type { Operation } from "@cybermasterchef/core";

export const lowerFirst: Operation = {
  id: "text.lowerFirst",
  name: "Lower First",
  description: "Lowercases first character.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.length === 0 ? "" : input.value[0]!.toLowerCase() + input.value.slice(1) };
  }
};
