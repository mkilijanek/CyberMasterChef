import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const bsonEncode: Operation = {
  id: "format.bsonEncode",
  name: "BSON Encode",
  description: "Encodes JSON into BSON bytes.",
  input: ["string", "json"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    const { serialize } = await import("bson");
    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.bsonEncode", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const encoded = serialize(payload as Record<string, unknown>);
    return { type: "bytes", value: new Uint8Array(encoded) };
  }
};
