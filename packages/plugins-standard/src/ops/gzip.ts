import type { Operation } from "@cybermasterchef/core";

async function gzipBytes(input: Uint8Array): Promise<Uint8Array> {
  const compressor = new CompressionStream("gzip");
  const writer = compressor.writable.getWriter();
  const safeInput = Uint8Array.from(input);
  await writer.write(safeInput);
  await writer.close();
  const output = await new Response(compressor.readable).arrayBuffer();
  return new Uint8Array(output);
}

export const gzip: Operation = {
  id: "compression.gzip",
  name: "Gzip",
  description: "Compresses input using GZIP and returns bytes.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const compressed = await gzipBytes(bytes);
    return { type: "bytes", value: compressed };
  }
};
