import type { Operation } from "@cybermasterchef/core";
import JSZip from "jszip";

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

export const unzip: Operation = {
  id: "compression.unzip",
  name: "Unzip",
  description: "Extracts ZIP archive entries into JSON (base64 payloads).",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const zipFile = await JSZip.loadAsync(input.value);
    const entries = [] as Array<{
      name: string;
      isDirectory: boolean;
      size: number;
      base64: string | null;
    }>;

    const files = Object.values(zipFile.files).sort((a, b) => a.name.localeCompare(b.name));
    for (const file of files) {
      if (file.dir) {
        entries.push({ name: file.name, isDirectory: true, size: 0, base64: null });
        continue;
      }
      const content = await file.async("uint8array");
      entries.push({
        name: file.name,
        isDirectory: false,
        size: content.length,
        base64: bytesToBase64(content)
      });
    }

    return { type: "json", value: { entries } };
  }
};
