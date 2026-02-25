import type { Operation } from "@cybermasterchef/core";
import { parseDateTime } from "./dateTimeUtils.js";

export const dateTimeDelta: Operation = {
  id: "date.dateTimeDelta",
  name: "Date Time Delta",
  description: "Computes delta between input datetime and a base datetime.",
  input: ["string"],
  output: "json",
  args: [
    {
      key: "base",
      label: "Base DateTime",
      type: "string",
      defaultValue: ""
    },
    {
      key: "format",
      label: "Format",
      type: "string",
      defaultValue: ""
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const baseRaw = typeof args.base === "string" ? args.base : "";
    if (!baseRaw) throw new Error("Base datetime argument is required");
    const format = typeof args.format === "string" ? args.format : "";

    const target = parseDateTime(input.value, format || undefined);
    const base = parseDateTime(baseRaw, format || undefined);

    const deltaMs = target.getTime() - base.getTime();
    const absMs = Math.abs(deltaMs);
    const sign = deltaMs === 0 ? 0 : deltaMs > 0 ? 1 : -1;

    return {
      type: "json",
      value: {
        milliseconds: deltaMs,
        seconds: deltaMs / 1000,
        minutes: deltaMs / 60000,
        hours: deltaMs / 3600000,
        days: deltaMs / 86400000,
        sign,
        absMilliseconds: absMs
      }
    };
  }
};
