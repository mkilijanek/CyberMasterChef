import type { Operation } from "@cybermasterchef/core";

export const generateImage: Operation = {
  id: "image.generate",
  name: "Generate Image",
  description: "Generates a solid color image.",
  input: ["string", "json", "number"],
  output: "bytes",
  args: [
    { key: "width", label: "Width", type: "number", defaultValue: 256 },
    { key: "height", label: "Height", type: "number", defaultValue: 256 },
    { key: "color", label: "Color", type: "string", defaultValue: "#000000" },
    {
      key: "format",
      label: "Format",
      type: "select",
      defaultValue: "png",
      options: [
        { label: "PNG", value: "png" },
        { label: "JPEG", value: "jpeg" },
        { label: "WEBP", value: "webp" }
      ]
    }
  ],
  run: async ({ args }) => {
    const { default: sharp } = await import("sharp");
    const width = typeof args.width === "number" ? Math.max(1, args.width) : 256;
    const height = typeof args.height === "number" ? Math.max(1, args.height) : 256;
    const color = typeof args.color === "string" ? args.color : "#000000";
    const format = args.format === "jpeg" || args.format === "webp" ? args.format : "png";

    const output = await sharp({
      create: {
        width: Math.floor(width),
        height: Math.floor(height),
        channels: 4,
        background: color
      }
    })
      .toFormat(format)
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
