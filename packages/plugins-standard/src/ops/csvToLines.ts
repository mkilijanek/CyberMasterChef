import type { Operation } from "@cybermasterchef/core";

export const csvToLines: Operation = {
  id: "text.csvToLines",
  name: "CSV To Lines",
  description: "Converts comma-separated values to lines.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.split(/,/u).map((v) => v.trim()).filter((v) => v.length > 0).join("\n") };
  }
};
