import type { Operation } from "@cybermasterchef/core";

export const trimLines: Operation = {
  id: "text.trimLines",
  name: "Trim Lines",
  description: "Trims each line independently.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/\r?\n/u).map((line) => line.trim()).join("\n") };
  }
};
