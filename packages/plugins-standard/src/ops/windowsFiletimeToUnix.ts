import type { Operation } from "@cybermasterchef/core";

const WINDOWS_EPOCH_OFFSET_MS = 11644473600000;
const TICKS_PER_MILLISECOND = 10000n;

export const windowsFiletimeToUnix: Operation = {
  id: "date.windowsFiletimeToUnix",
  name: "Windows FILETIME to Unix",
  description: "Converts Windows FILETIME (100ns ticks since 1601) to Unix timestamp.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "seconds",
      label: "Output seconds",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const raw = input.value.trim();
    if (!/^-?\d+$/.test(raw)) throw new Error("Expected integer FILETIME value");

    const ticks = BigInt(raw);
    const unixMsBig = ticks / TICKS_PER_MILLISECOND - BigInt(WINDOWS_EPOCH_OFFSET_MS);
    const unixMs = Number(unixMsBig);
    if (!Number.isFinite(unixMs)) throw new Error("FILETIME value out of range");

    const seconds = typeof args.seconds === "boolean" ? args.seconds : false;
    return { type: "string", value: seconds ? String(Math.trunc(unixMs / 1000)) : String(unixMs) };
  }
};
