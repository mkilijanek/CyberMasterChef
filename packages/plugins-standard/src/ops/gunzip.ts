import type { Operation } from "@cybermasterchef/core";

async function gunzipBytes(input: Uint8Array): Promise<Uint8Array> {
  try {
    const decompressor = new DecompressionStream("gzip");
    const writer = decompressor.writable.getWriter();
    const safeInput = Uint8Array.from(input);
    await writer.write(safeInput);
    await writer.close();
    const output = await new Response(decompressor.readable).arrayBuffer();
    return new Uint8Array(output);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to gunzip input: ${reason}`, { cause: error });
  }
}

export const gunzip: Operation = {
  id: "compression.gunzip",
  name: "Gunzip",
  description: "Decompresses GZIP bytes and returns bytes.",
  input: ["bytes"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") {
      throw new Error("Expected bytes input");
    }
    const decompressed = await gunzipBytes(input.value);
    return { type: "bytes", value: decompressed };
  }
};
