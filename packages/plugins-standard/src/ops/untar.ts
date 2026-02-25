import type { Operation } from "@cybermasterchef/core";

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
  end: (chunk?: Uint8Array) => void;
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

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
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
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk) => {
          if (chunk instanceof Uint8Array) {
            chunks.push(chunk);
            return;
          }
          if (typeof chunk === "string") {
            chunks.push(new TextEncoder().encode(chunk));
            return;
          }
          throw new Error("Unsupported tar entry chunk type");
        });
        stream.on("end", () => {
          const content = concatChunks(chunks);
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

    extractor.end(input.value);
    await resultPromise;

    entries.sort((a, b) => a.name.localeCompare(b.name));
    return { type: "json", value: { entries } };
  }
};
