import type { Operation } from "@cybermasterchef/core";
import { formatNumber, parseNumberList } from "./numericListUtils.js";

export const multiply: Operation = {
  id: "math.multiply",
  name: "Multiply",
  description: "Multiplies delimiter-separated numeric values.",
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
    return {
      type: "string",
      value: formatNumber(values.reduce((acc, value) => acc * value, 1))
    };
  }
};
