import type { Operation } from "@cybermasterchef/core";

export const includesText: Operation = {
  id: "text.includes",
  name: "Includes",
  description: "Returns 1 if text includes provided value, else 0.",
  input: ["string"],
  output: "number",
  args: [
    {
      key: "value",
      label: "Value",
      type: "string",
      defaultValue: ""
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = typeof args.value === "string" ? args.value : "";
    if (value.length === 0) return { type: "number", value: 0 };
    return { type: "number", value: input.value.includes(value) ? 1 : 0 };
  }
};
