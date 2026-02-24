import type { Operation } from "@cybermasterchef/core";

export const append: Operation = {
  id: "text.append",
  name: "Append",
  description: "Appends a suffix to text.",
  input: ["string"],
  output: "string",
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
    return { type: "string", value: input.value + value };
  }
};
