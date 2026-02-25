import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const cborEncode: Operation = {
  id: "format.cborEncode",
  name: "CBOR Encode",
  description: "Encodes JSON into CBOR bytes.",
  input: ["string", "json"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    const { encode } = await import("cbor");
    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.cborEncode", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const encoded = encode(payload);
    return { type: "bytes", value: new Uint8Array(encoded) };
  }
};
