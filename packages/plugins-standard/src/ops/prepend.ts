import type { Operation } from "@cybermasterchef/core";

export const prepend: Operation = {
  id: "text.prepend",
  name: "Prepend",
  description: "Prepends a prefix to text.",
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
    return { type: "string", value: value + input.value };
  }
};
