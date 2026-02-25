import type { Operation } from "@cybermasterchef/core";
type TarPack = {
  on: (event: "data" | "error" | "end", cb: (...args: unknown[]) => void) => void;
  entry: (header: { name: string; size: number; mode?: number }, data: Buffer) => void;
  finalize: () => void;
};

export const tar: Operation = {
  id: "compression.tar",
  name: "Tar",
  description: "Creates a TAR archive containing a single file.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [
    {
      key: "filename",
      label: "Filename",
      type: "string",
      defaultValue: "data.bin"
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const filename = typeof args.filename === "string" ? args.filename : "data.bin";
    const data =
      input.type === "bytes" ? Buffer.from(input.value) : Buffer.from(input.value);

    const { pack } = (await import("tar-stream")) as {
      pack: () => TarPack;
    };
    const archive = pack();
    const chunks: Buffer[] = [];

    const tarPromise = new Promise<Uint8Array>((resolve, reject) => {
      archive.on("data", (chunk) => {
        chunks.push(chunk as Buffer);
      });
      archive.on("error", (error) => {
        reject(error as Error);
      });
      archive.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    });

    archive.entry({ name: filename, size: data.length, mode: 0o644 }, data);
    archive.finalize();

    return { type: "bytes", value: await tarPromise };
  }
};
