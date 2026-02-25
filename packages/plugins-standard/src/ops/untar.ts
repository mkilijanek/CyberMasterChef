import type { Operation } from "@cybermasterchef/core";
import { Readable } from "node:stream";

type TarHeader = {
  name: string;
  type: string;
  size: number;
};

type TarEntryStream = NodeJS.ReadableStream & {
  on: (event: "data" | "end" | "error", cb: (...args: unknown[]) => void) => void;
};

type TarExtract = {
  on: (
    event: "entry" | "finish" | "error",
    cb: (...args: unknown[]) => void
  ) => void;
};

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

export const untar: Operation = {
  id: "compression.untar",
  name: "Untar",
  description: "Extracts TAR archive entries into JSON (base64 payloads).",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");

    const entries: Array<{
      name: string;
      type: string;
      size: number;
      base64: string | null;
    }> = [];

    const { extract } = (await import("tar-stream")) as {
      extract: () => TarExtract;
    };
    const extractor = extract() as TarExtract & NodeJS.WritableStream;

    const resultPromise = new Promise<void>((resolve, reject) => {
      extractor.on("entry", (headerRaw, streamRaw, nextRaw) => {
        const header = headerRaw as TarHeader;
        const stream = streamRaw as TarEntryStream;
        const next = nextRaw as () => void;
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk as Buffer));
        stream.on("end", () => {
          const content = Buffer.concat(chunks);
          const base64 = header.type === "file" ? bytesToBase64(content) : null;
          entries.push({
            name: header.name,
            type: header.type,
            size: header.size || content.length,
            base64
          });
          next();
        });
        stream.on("error", (error) => reject(error as Error));
      });
      extractor.on("finish", resolve);
      extractor.on("error", reject);
    });

    Readable.from([Buffer.from(input.value)]).pipe(extractor);
    await resultPromise;

    entries.sort((a, b) => a.name.localeCompare(b.name));
    return { type: "json", value: { entries } };
  }
};
