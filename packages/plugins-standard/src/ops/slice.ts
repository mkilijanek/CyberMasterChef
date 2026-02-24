import type { Operation } from "@cybermasterchef/core";

export const slice: Operation = {
  id: "text.slice",
  name: "Slice",
  description: "Slices text between start and end positions.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "start",
      label: "Start",
      type: "number",
      defaultValue: 0
    },
    {
      key: "end",
      label: "End",
      type: "number"
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const start = typeof args.start === "number" ? args.start : 0;
    const end = typeof args.end === "number" ? args.end : undefined;
    return { type: "string", value: input.value.slice(start, end) };
  }
};
