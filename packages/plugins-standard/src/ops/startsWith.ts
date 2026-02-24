import type { Operation } from "@cybermasterchef/core";

export const startsWith: Operation = {
  id: "text.startsWith",
  name: "Starts With",
  description: "Returns 1 if text starts with provided value, else 0.",
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
    return { type: "number", value: input.value.startsWith(value) ? 1 : 0 };
  }
};
