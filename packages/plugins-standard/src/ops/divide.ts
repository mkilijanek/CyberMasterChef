import type { Operation } from "@cybermasterchef/core";
import { formatNumber, parseNumberList } from "./numericListUtils.js";

export const divide: Operation = {
  id: "math.divide",
  name: "Divide",
  description: "Divides delimiter-separated numeric values from left to right.",
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
    if (values.length === 0) {
      return { type: "string", value: "0" };
    }
    const initial = values[0]!;
    const rest = values.slice(1);
    const result = rest.reduce((acc, value) => {
      if (value === 0) {
        throw new Error("Cannot divide by zero");
      }
      return acc / value;
    }, initial);
    return { type: "string", value: formatNumber(result) };
  }
};
