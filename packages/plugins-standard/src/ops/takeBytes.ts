import type { Operation } from "@cybermasterchef/core";
import { joinLines, splitLines, takeByteRange, toBytes } from "./byteTransformUtils.js";

export const takeBytes: Operation = {
  id: "bytes.takeBytes",
  name: "Take bytes",
  description: "Takes a slice of the specified number of bytes from the data.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [
    { key: "start", label: "Start", type: "number", defaultValue: 0 },
    { key: "length", label: "Length", type: "number", defaultValue: 5 },
    {
      key: "applyToEachLine",
      label: "Apply to each line",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    const bytes = toBytes(input);
    const start = typeof args.start === "number" ? args.start : 0;
    const length = typeof args.length === "number" ? args.length : 5;
    const applyToEachLine = args.applyToEachLine === true;

    if (!applyToEachLine) {
      return { type: "bytes", value: takeByteRange(bytes, start, length) };
    }

    return {
      type: "bytes",
      value: joinLines(splitLines(bytes).map((line) => takeByteRange(line, start, length)))
    };
  }
};
