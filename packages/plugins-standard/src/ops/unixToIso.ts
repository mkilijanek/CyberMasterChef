import type { Operation } from "@cybermasterchef/core";

export const unixToIso: Operation = {
  id: "date.unixToIso",
  name: "Unix to ISO",
  description: "Converts Unix timestamp to ISO-8601 UTC format.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "seconds",
      label: "Unix in seconds",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const raw = input.value.trim();
    if (!/^-?\d+$/.test(raw)) throw new Error("Expected integer Unix timestamp");
    const base = Number(raw);
    if (!Number.isFinite(base)) throw new Error("Invalid Unix timestamp");
    const seconds = typeof args.seconds === "boolean" ? args.seconds : false;
    const ms = seconds ? base * 1000 : base;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid Unix timestamp");
    return { type: "string", value: date.toISOString() };
  }
};
