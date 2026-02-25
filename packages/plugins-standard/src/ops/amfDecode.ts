import type { Operation } from "@cybermasterchef/core";
const isNode = () => typeof process !== "undefined" && !!process.versions?.node;

async function decodeAmf(data: Uint8Array, version: "AMF0" | "AMF3"): Promise<unknown> {
  if (!isNode()) {
    throw new Error("AMF decoding is only supported in Node.js environments");
  }
  const amf = (await import("amfjs")) as {
    AMF0: unknown;
    AMF3: unknown;
    AMFDecoder: new (stream: NodeJS.ReadableStream) => { decode: (type: unknown) => unknown };
  };

  const { Readable } = await import("node:stream");
  const stream = new Readable({ read() {} });
  stream.push(Buffer.from(data));
  stream.push(null);
  const decoder = new amf.AMFDecoder(stream);
  return decoder.decode(version === "AMF3" ? amf.AMF3 : amf.AMF0);
}

export const amfDecode: Operation = {
  id: "format.amfDecode",
  name: "AMF Decode",
  description: "Decodes AMF0/AMF3 bytes into JSON.",
  input: ["bytes"],
  output: "json",
  args: [
    {
      key: "version",
      label: "Version",
      type: "select",
      defaultValue: "AMF0",
      options: [
        { label: "AMF0", value: "AMF0" },
        { label: "AMF3", value: "AMF3" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const version = args.version === "AMF3" ? "AMF3" : "AMF0";
    try {
      const value = await decodeAmf(input.value, version);
      return { type: "json", value };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to decode AMF input: ${reason}`, { cause: error });
    }
  }
};
