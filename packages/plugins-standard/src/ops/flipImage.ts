import type { Operation } from "@cybermasterchef/core";

export const flipImage: Operation = {
  id: "image.flip",
  name: "Flip Image",
  description: "Flips an image horizontally and/or vertically.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "horizontal", label: "Horizontal", type: "boolean", defaultValue: true },
    { key: "vertical", label: "Vertical", type: "boolean", defaultValue: false }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const horizontal =
      typeof args.horizontal === "boolean" ? args.horizontal : true;
    const vertical = typeof args.vertical === "boolean" ? args.vertical : false;

    let image = sharp(Buffer.from(input.value));
    if (horizontal) image = image.flop();
    if (vertical) image = image.flip();

    const output = await image.toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
