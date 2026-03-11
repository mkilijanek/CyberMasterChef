import type { Operation } from "@cybermasterchef/core";
import { formatNumber } from "./numericListUtils.js";
import {
  decodeFloats,
  normalizeEndianness,
  normalizeFloatWidth,
  parseByteInput
} from "./floatCodecUtils.js";

export const fromFloat: Operation = {
  id: "codec.fromFloat",
  name: "From Float",
  description: "Decodes IEEE-754 float bytes into numeric values.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "endianness",
      label: "Endianness",
      type: "select",
      defaultValue: "big",
      options: [
        { label: "Big endian", value: "big" },
        { label: "Little endian", value: "little" }
      ]
    },
    {
      key: "width",
      label: "Width",
      type: "select",
      defaultValue: "float32",
      options: [
        { label: "Float32", value: "float32" },
        { label: "Float64", value: "float64" }
      ]
    },
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: " "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : " ";
    const bytes = input.type === "bytes" ? input.value : parseByteInput(input.value, delimiter);
    if (bytes.length === 0) {
      return { type: "string", value: "" };
    }
    return {
      type: "string",
      value: decodeFloats(
        bytes,
        normalizeFloatWidth(args.width),
        normalizeEndianness(args.endianness)
      )
        .map(formatNumber)
        .join(delimiter)
    };
  }
};
