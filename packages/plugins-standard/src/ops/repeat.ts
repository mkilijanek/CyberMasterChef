import type { Operation } from "@cybermasterchef/core";

export const repeat: Operation = {
  id: "text.repeat",
  name: "Repeat",
  description: "Repeats text N times.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "count",
      label: "Count",
      type: "number",
      defaultValue: 1
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const rawCount = typeof args.count === "number" ? args.count : 1;
    const count = Math.max(0, Math.floor(rawCount));
    return { type: "string", value: input.value.repeat(count) };
  }
};
