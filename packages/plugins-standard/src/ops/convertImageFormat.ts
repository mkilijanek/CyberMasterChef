import type { Operation } from "@cybermasterchef/core";

const FORMATS = ["png", "jpeg", "webp", "avif", "tiff"] as const;

export const convertImageFormat: Operation = {
  id: "image.convertFormat",
  name: "Convert Image Format",
  description: "Converts image bytes to a selected format.",
  input: ["bytes"],
  output: "bytes",
  args: [
    {
      key: "format",
      label: "Format",
      type: "select",
      defaultValue: "png",
      options: FORMATS.map((format) => ({ label: format.toUpperCase(), value: format }))
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const format = FORMATS.includes(args.format as (typeof FORMATS)[number])
      ? (args.format as (typeof FORMATS)[number])
      : "png";

    const output = await sharp(Buffer.from(input.value))
      .toFormat(format)
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
