import type { Operation } from "@cybermasterchef/core";
import { parseDateTime } from "./dateTimeUtils.js";

export const parseDateTimeOp: Operation = {
  id: "date.parseDateTime",
  name: "Parse Date Time",
  description: "Parses a datetime string and outputs ISO-8601 UTC.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "format",
      label: "Format",
      type: "string",
      defaultValue: ""
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const format = typeof args.format === "string" ? args.format : "";
    const date = parseDateTime(input.value, format || undefined);
    return { type: "string", value: date.toISOString() };
  }
};
