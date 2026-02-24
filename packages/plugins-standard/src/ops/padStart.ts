import type { Operation } from "@cybermasterchef/core";

export const padStart: Operation = {
  id: "text.padStart",
  name: "Pad Start",
  description: "Pads text at the start up to target length.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "length",
      label: "Length",
      type: "number",
      defaultValue: 0
    },
    {
      key: "fill",
      label: "Fill",
      type: "string",
      defaultValue: " "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const length = typeof args.length === "number" ? Math.max(0, Math.floor(args.length)) : 0;
    const fill = typeof args.fill === "string" && args.fill.length > 0 ? args.fill : " ";
    return { type: "string", value: input.value.padStart(length, fill) };
  }
};
