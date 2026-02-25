import type { Operation } from "@cybermasterchef/core";

export const coverImage: Operation = {
  id: "image.cover",
  name: "Cover Image",
  description: "Resizes an image to cover a bounding box.",
  input: ["bytes"],
  output: "bytes",
  args: [
    {
      key: "width",
      label: "Width",
      type: "number",
      defaultValue: 512
    },
    {
      key: "height",
      label: "Height",
      type: "number",
      defaultValue: 512
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const width = typeof args.width === "number" ? Math.max(1, args.width) : 512;
    const height = typeof args.height === "number" ? Math.max(1, args.height) : 512;

    const output = await sharp(Buffer.from(input.value))
      .resize({ width: Math.floor(width), height: Math.floor(height), fit: "cover" })
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
