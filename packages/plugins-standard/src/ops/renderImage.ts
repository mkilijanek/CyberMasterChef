import type { Operation } from "@cybermasterchef/core";
import { loadSharp } from "./sharpLoader.js";

export const renderImage: Operation = {
  id: "image.render",
  name: "Render Image",
  description: "Renders an SVG string into image bytes.",
  input: ["string"],
  output: "bytes",
  args: [
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
  run: async ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const sharp = await loadSharp();
    const format = args.format === "jpeg" || args.format === "webp" ? args.format : "png";
    const output = await sharp(Buffer.from(input.value)).toFormat(format).toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
