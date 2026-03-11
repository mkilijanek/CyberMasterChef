import type { Operation } from "@cybermasterchef/core";
import { inputToBytes, shannonEntropy } from "./forensicUtils.js";

export const entropy: Operation = {
  id: "forensic.entropy",
  name: "Entropy",
  description: "Computes Shannon entropy for the input and optional fixed-size segments.",
  input: ["bytes", "string"],
  output: "json",
  args: [
    {
      key: "segmentSize",
      label: "Segment size",
      type: "number",
      defaultValue: 0
    }
  ],
  run: ({ input, args }) => {
    const bytes = inputToBytes(input);
    const segmentSizeArg = typeof args.segmentSize === "number" ? args.segmentSize : 0;
    const segmentSize = Math.max(0, Math.floor(segmentSizeArg));
    const segments: Array<{ offset: number; size: number; entropy: number }> = [];

    if (segmentSize > 0) {
      for (let offset = 0; offset < bytes.length; offset += segmentSize) {
        const slice = bytes.slice(offset, offset + segmentSize);
        segments.push({
          offset,
          size: slice.length,
          entropy: shannonEntropy(slice)
        });
      }
    }

    return {
      type: "json",
      value: {
        sizeBytes: bytes.length,
        overallEntropy: shannonEntropy(bytes),
        distinctByteCount: new Set(bytes).size,
        segmentSize,
        segments
      }
    };
  }
};
