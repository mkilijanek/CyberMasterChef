import type { Operation } from "@cybermasterchef/core";

export const rotateImage: Operation = {
  id: "image.rotate",
  name: "Rotate Image",
  description: "Rotates an image by a given angle.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "angle", label: "Angle", type: "number", defaultValue: 90 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const angle = typeof args.angle === "number" ? args.angle : 0;
    const output = await sharp(Buffer.from(input.value)).rotate(angle).toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
