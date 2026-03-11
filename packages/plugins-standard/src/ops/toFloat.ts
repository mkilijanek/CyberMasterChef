import type { Operation } from "@cybermasterchef/core";
import { parseNumberList } from "./numericListUtils.js";
import { encodeFloats, normalizeEndianness, normalizeFloatWidth } from "./floatCodecUtils.js";

export const toFloat: Operation = {
  id: "codec.toFloat",
  name: "To Float",
  description: "Encodes numeric values into IEEE-754 float bytes.",
  input: ["string"],
  output: "bytes",
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
    if (input.type !== "string") throw new Error("Expected string input");
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : " ";
    const values = parseNumberList(input.value, delimiter);
    if (values.length === 0) {
      return { type: "bytes", value: new Uint8Array() };
    }
    return {
      type: "bytes",
      value: encodeFloats(
        values,
        normalizeFloatWidth(args.width),
        normalizeEndianness(args.endianness)
      )
    };
  }
};
