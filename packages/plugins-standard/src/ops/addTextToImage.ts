import type { Operation } from "@cybermasterchef/core";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const addTextToImage: Operation = {
  id: "image.addText",
  name: "Add Text To Image",
  description: "Overlays text on an image using an SVG layer.",
  input: ["bytes"],
  output: "bytes",
  args: [
    {
      key: "text",
      label: "Text",
      type: "string",
      defaultValue: "CyberMasterChef"
    },
    {
      key: "color",
      label: "Color",
      type: "string",
      defaultValue: "#ffffff"
    },
    {
      key: "fontSize",
      label: "Font Size",
      type: "number",
      defaultValue: 24
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const text = typeof args.text === "string" ? args.text : "CyberMasterChef";
    const color = typeof args.color === "string" ? args.color : "#ffffff";
    const rawFontSize = typeof args.fontSize === "number" ? args.fontSize : 24;
    const fontSize = Math.max(6, Math.floor(rawFontSize));

    const image = sharp(Buffer.from(input.value));
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("Unable to determine image dimensions");
    }

    const safeText = escapeXml(text);
    const svg = `<svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg"><style>text{fill:${color};font-size:${fontSize}px;font-family:Arial, sans-serif;}</style><text x="10" y="${fontSize + 10}">${safeText}</text></svg>`;

    const output = await image
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .toFormat(metadata.format ?? "png")
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
