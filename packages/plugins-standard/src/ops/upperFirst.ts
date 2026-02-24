import type { Operation } from "@cybermasterchef/core";

export const upperFirst: Operation = {
  id: "text.upperFirst",
  name: "Upper First",
  description: "Uppercases first character.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.length === 0 ? "" : input.value[0]!.toUpperCase() + input.value.slice(1) };
  }
};
