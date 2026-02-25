import type { Operation } from "@cybermasterchef/core";

export const cropImage: Operation = {
  id: "image.crop",
  name: "Crop Image",
  description: "Crops an image to the specified rectangle.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "left", label: "Left", type: "number", defaultValue: 0 },
    { key: "top", label: "Top", type: "number", defaultValue: 0 },
    { key: "width", label: "Width", type: "number", defaultValue: 100 },
    { key: "height", label: "Height", type: "number", defaultValue: 100 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const left = typeof args.left === "number" ? Math.max(0, Math.floor(args.left)) : 0;
    const top = typeof args.top === "number" ? Math.max(0, Math.floor(args.top)) : 0;
    const width = typeof args.width === "number" ? Math.max(1, Math.floor(args.width)) : 100;
    const height =
      typeof args.height === "number" ? Math.max(1, Math.floor(args.height)) : 100;

    const output = await sharp(Buffer.from(input.value))
      .extract({ left, top, width, height })
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
