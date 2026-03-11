import type { Operation } from "@cybermasterchef/core";
import { formatNumber, parseNumberList } from "./numericListUtils.js";

export const sum: Operation = {
  id: "math.sum",
  name: "Sum",
  description: "Sums delimiter-separated numeric values.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: " "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : " ";
    const values = parseNumberList(input.value, delimiter);
    return { type: "string", value: formatNumber(values.reduce((acc, value) => acc + value, 0)) };
  }
};
