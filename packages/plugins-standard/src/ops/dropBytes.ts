import type { Operation } from "@cybermasterchef/core";
import { dropByteRange, joinLines, splitLines, toBytes } from "./byteTransformUtils.js";

export const dropBytes: Operation = {
  id: "bytes.dropBytes",
  name: "Drop bytes",
  description: "Cuts a slice of the specified number of bytes out of the data.",
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
      return { type: "bytes", value: dropByteRange(bytes, start, length) };
    }

    return {
      type: "bytes",
      value: joinLines(splitLines(bytes).map((line) => dropByteRange(line, start, length)))
    };
  }
};
