import type { Operation } from "@cybermasterchef/core";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

export const isoWeekday: Operation = {
  id: "date.isoWeekday",
  name: "ISO Weekday",
  description: "Resolves weekday from ISO-8601 timestamp (UTC).",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "numeric",
      label: "Numeric (1-7)",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const raw = input.value.trim();
    if (raw.length === 0) throw new Error("Expected non-empty ISO timestamp");
    const ms = Date.parse(raw);
    if (!Number.isFinite(ms)) throw new Error("Invalid ISO timestamp");
    const day = new Date(ms).getUTCDay();
    const numeric = typeof args.numeric === "boolean" ? args.numeric : false;
    if (numeric) {
      return { type: "string", value: String(day === 0 ? 7 : day) };
    }
    return { type: "string", value: WEEKDAY_NAMES[day] };
  }
};
