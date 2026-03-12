import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

type ProtobufModule = {
  parse: (schema: string) => { root: { lookupType: (messageType: string) => {
    verify: (payload: Record<string, unknown>) => string | null;
    fromObject: (payload: Record<string, unknown>) => unknown;
    encode: (message: unknown) => { finish: () => Uint8Array };
  } } };
};

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const protobufEncode: Operation = {
  id: "format.protobufEncode",
  name: "Protobuf Encode",
  description: "Encodes JSON into Protobuf bytes using a schema.",
  input: ["string", "json"],
  output: "bytes",
  args: [
    { key: "schema", label: "Schema (.proto)", type: "string", defaultValue: "" },
    { key: "messageType", label: "Message Type", type: "string", defaultValue: "" }
  ],
  run: async ({ input, args }) => {
    const schema = typeof args.schema === "string" ? args.schema : "";
    const messageType = typeof args.messageType === "string" ? args.messageType : "";
    if (!schema) throw new Error("Schema argument is required");
    if (!messageType) throw new Error("Message type argument is required");

    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.protobufEncode", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const protobuf = (await import("protobufjs")) as unknown as ProtobufModule;
    const root = protobuf.parse(schema).root;
    const type = root.lookupType(messageType);
    const errMsg = type.verify(payload as Record<string, unknown>);
    if (errMsg) throw new Error(`Protobuf validation failed: ${errMsg}`);

    const message = type.fromObject(payload as Record<string, unknown>);
    const buffer = type.encode(message).finish();
    return { type: "bytes", value: new Uint8Array(buffer) };
  }
};
