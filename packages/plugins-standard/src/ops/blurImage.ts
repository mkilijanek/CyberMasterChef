import type { Operation } from "@cybermasterchef/core";

export const blurImage: Operation = {
  id: "image.blur",
  name: "Blur Image",
  description: "Applies a Gaussian blur to image bytes.",
  input: ["bytes"],
  output: "bytes",
  args: [
    {
      key: "sigma",
      label: "Blur Sigma",
      type: "number",
      defaultValue: 2
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const rawSigma = typeof args.sigma === "number" ? args.sigma : 2;
    const sigma = Math.max(0.3, Math.min(100, rawSigma));

    const output = await sharp(Buffer.from(input.value))
      .blur(sigma)
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
