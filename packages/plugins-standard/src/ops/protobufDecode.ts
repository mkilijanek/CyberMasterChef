import type { Operation } from "@cybermasterchef/core";

type ProtobufModule = {
  parse: (schema: string) => { root: { lookupType: (messageType: string) => {
    decode: (reader: unknown) => unknown;
    toObject: (
      decoded: unknown,
      options: { longs: StringConstructor; enums: StringConstructor; defaults: boolean }
    ) => unknown;
  } } };
  Reader: { create: (input: Uint8Array) => unknown };
};

export const protobufDecode: Operation = {
  id: "format.protobufDecode",
  name: "Protobuf Decode",
  description: "Decodes Protobuf bytes into JSON using a schema.",
  input: ["bytes"],
  output: "json",
  args: [
    { key: "schema", label: "Schema (.proto)", type: "string", defaultValue: "" },
    { key: "messageType", label: "Message Type", type: "string", defaultValue: "" }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const schema = typeof args.schema === "string" ? args.schema : "";
    const messageType = typeof args.messageType === "string" ? args.messageType : "";
    if (!schema) throw new Error("Schema argument is required");
    if (!messageType) throw new Error("Message type argument is required");

    const protobuf = (await import("protobufjs")) as unknown as ProtobufModule;
    const root = protobuf.parse(schema).root;
    const type = root.lookupType(messageType);
    const decoded = type.decode(protobuf.Reader.create(Uint8Array.from(input.value)));
    const value = type.toObject(decoded, {
      longs: String,
      enums: String,
      defaults: true
    });
    return { type: "json", value };
  }
};
