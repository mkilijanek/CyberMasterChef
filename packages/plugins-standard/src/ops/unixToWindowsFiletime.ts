import type { Operation } from "@cybermasterchef/core";

const WINDOWS_EPOCH_OFFSET_MS = 11644473600000;
const TICKS_PER_MILLISECOND = 10000;

export const unixToWindowsFiletime: Operation = {
  id: "date.unixToWindowsFiletime",
  name: "Unix to Windows FILETIME",
  description: "Converts Unix timestamp to Windows FILETIME (100ns ticks since 1601).",
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
    const unixMs = seconds ? base * 1000 : base;
    const filetime = BigInt(unixMs + WINDOWS_EPOCH_OFFSET_MS) * BigInt(TICKS_PER_MILLISECOND);
    return { type: "string", value: filetime.toString() };
  }
};
