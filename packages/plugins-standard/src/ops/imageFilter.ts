import type { Operation } from "@cybermasterchef/core";

export const imageFilter: Operation = {
  id: "image.filter",
  name: "Image Filter",
  description: "Applies a simple filter to the image.",
  input: ["bytes"],
  output: "bytes",
  args: [
    {
      key: "filter",
      label: "Filter",
      type: "select",
      defaultValue: "grayscale",
      options: [
        { label: "Grayscale", value: "grayscale" },
        { label: "Sepia", value: "sepia" },
        { label: "Negate", value: "negate" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const filter =
      args.filter === "sepia" || args.filter === "negate" ? args.filter : "grayscale";

    let image = sharp(Buffer.from(input.value));
    if (filter === "grayscale") {
      image = image.grayscale();
    } else if (filter === "sepia") {
      image = image.grayscale().tint("#704214");
    } else {
      image = image.negate({ alpha: false });
    }

    const output = await image.toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
