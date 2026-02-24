import type { Operation } from "@cybermasterchef/core";

export const endsWith: Operation = {
  id: "text.endsWith",
  name: "Ends With",
  description: "Returns 1 if text ends with provided value, else 0.",
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
    return { type: "number", value: input.value.endsWith(value) ? 1 : 0 };
  }
};
