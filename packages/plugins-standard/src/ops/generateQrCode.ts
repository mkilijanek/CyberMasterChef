import type { Operation } from "@cybermasterchef/core";
import QRCode from "qrcode";

export const generateQrCode: Operation = {
  id: "image.generateQrCode",
  name: "Generate QR Code",
  description: "Generates a QR code PNG from input text.",
  input: ["string"],
  output: "bytes",
  args: [
    { key: "scale", label: "Scale", type: "number", defaultValue: 4 },
    { key: "margin", label: "Margin", type: "number", defaultValue: 2 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const scale = typeof args.scale === "number" ? Math.max(1, args.scale) : 4;
    const margin = typeof args.margin === "number" ? Math.max(0, args.margin) : 2;

    const output = await QRCode.toBuffer(input.value, {
      type: "png",
      scale: Math.floor(scale),
      margin: Math.floor(margin)
    });

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
