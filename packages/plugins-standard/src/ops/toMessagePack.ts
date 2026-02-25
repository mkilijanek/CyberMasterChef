import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const toMessagePack: Operation = {
  id: "format.toMessagePack",
  name: "To MessagePack",
  description: "Encodes JSON into MessagePack bytes.",
  input: ["string", "json"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    const { encode } = await import("@msgpack/msgpack");
    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.toMessagePack", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const encoded = encode(payload);
    return { type: "bytes", value: encoded };
  }
};
