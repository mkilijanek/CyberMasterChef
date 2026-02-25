import type { Operation } from "@cybermasterchef/core";
import JSZip from "jszip";

export const zip: Operation = {
  id: "compression.zip",
  name: "Zip",
  description: "Creates a ZIP archive containing a single file.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [
    {
      key: "filename",
      label: "Filename",
      type: "string",
      defaultValue: "data.bin"
    },
    {
      key: "compression",
      label: "Compression",
      type: "select",
      defaultValue: "DEFLATE",
      options: [
        { label: "Deflate", value: "DEFLATE" },
        { label: "Store", value: "STORE" }
      ]
    },
    {
      key: "level",
      label: "Compression Level (0-9)",
      type: "number",
      defaultValue: 6
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const filename = typeof args.filename === "string" ? args.filename : "data.bin";
    const compression =
      args.compression === "STORE" || args.compression === "DEFLATE"
        ? args.compression
        : "DEFLATE";
    const rawLevel = typeof args.level === "number" ? args.level : 6;
    const level = Math.max(0, Math.min(9, Math.floor(rawLevel)));

    const data =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);

    const zipFile = new JSZip();
    zipFile.file(filename, data);

    const output = await zipFile.generateAsync({
      type: "uint8array",
      compression,
      compressionOptions: { level }
    });

    return { type: "bytes", value: output };
  }
};
