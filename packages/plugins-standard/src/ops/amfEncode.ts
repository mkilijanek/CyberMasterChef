import type { Operation } from "@cybermasterchef/core";
import { OperationJsonParseError } from "@cybermasterchef/core";
import { PassThrough } from "node:stream";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

async function encodeAmf(value: unknown, version: "AMF0" | "AMF3"): Promise<Uint8Array> {
  const amf = (await import("amfjs")) as {
    AMF0: unknown;
    AMF3: unknown;
    AMFEncoder: new (stream: NodeJS.WritableStream) => { writeObject: (val: unknown, type: unknown) => void };
  };

  const stream = new PassThrough();
  const chunks: Buffer[] = [];
  stream.on("data", (chunk) => chunks.push(chunk as Buffer));
  const encoder = new amf.AMFEncoder(stream);
  encoder.writeObject(value, version === "AMF3" ? amf.AMF3 : amf.AMF0);
  stream.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      reject(error);
    });
  });

  return new Uint8Array(Buffer.concat(chunks));
}

export const amfEncode: Operation = {
  id: "format.amfEncode",
  name: "AMF Encode",
  description: "Encodes JSON data into AMF0/AMF3 bytes.",
  input: ["string", "json"],
  output: "bytes",
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
    const version = args.version === "AMF3" ? "AMF3" : "AMF0";
    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.amfEncode", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const encoded = await encodeAmf(payload, version);
    return { type: "bytes", value: encoded };
  }
};
