import type { Operation } from "@cybermasterchef/core";

export const resizeImage: Operation = {
  id: "image.resize",
  name: "Resize Image",
  description: "Resizes an image to the specified dimensions.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "width", label: "Width", type: "number", defaultValue: 256 },
    { key: "height", label: "Height", type: "number", defaultValue: 256 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const width = typeof args.width === "number" ? Math.max(1, args.width) : 256;
    const height = typeof args.height === "number" ? Math.max(1, args.height) : 256;

    const output = await sharp(Buffer.from(input.value))
      .resize({ width: Math.floor(width), height: Math.floor(height), fit: "fill" })
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
