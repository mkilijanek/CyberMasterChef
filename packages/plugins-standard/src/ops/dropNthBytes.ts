import type { Operation } from "@cybermasterchef/core";
import { dropNth, joinLines, splitLines, toBytes } from "./byteTransformUtils.js";

export const dropNthBytes: Operation = {
  id: "bytes.dropNthBytes",
  name: "Drop nth bytes",
  description: "Drops every nth byte starting with a given byte.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [
    { key: "every", label: "Drop every", type: "number", defaultValue: 4 },
    { key: "startingAt", label: "Starting at", type: "number", defaultValue: 0 },
    {
      key: "applyToEachLine",
      label: "Apply to each line",
      type: "boolean",
      defaultValue: false
    }
  ],
  run: ({ input, args }) => {
    const bytes = toBytes(input);
    const every = typeof args.every === "number" ? args.every : 4;
    const startingAt = typeof args.startingAt === "number" ? args.startingAt : 0;
    const applyToEachLine = args.applyToEachLine === true;

    if (!applyToEachLine) {
      return { type: "bytes", value: dropNth(bytes, every, startingAt) };
    }

    return {
      type: "bytes",
      value: joinLines(splitLines(bytes).map((line) => dropNth(line, every, startingAt)))
    };
  }
};
