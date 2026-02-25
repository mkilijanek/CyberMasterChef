import type { Operation } from "@cybermasterchef/core";

export const sharpenImage: Operation = {
  id: "image.sharpen",
  name: "Sharpen Image",
  description: "Sharpens image details.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "sigma", label: "Sigma", type: "number", defaultValue: 1 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const sigma = typeof args.sigma === "number" ? Math.max(0.1, args.sigma) : 1;
    const output = await sharp(Buffer.from(input.value)).sharpen(sigma).toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
