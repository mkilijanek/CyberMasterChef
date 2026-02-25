import type { Operation } from "@cybermasterchef/core";
import protobuf from "protobufjs";

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
  run: ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const schema = typeof args.schema === "string" ? args.schema : "";
    const messageType = typeof args.messageType === "string" ? args.messageType : "";
    if (!schema) throw new Error("Schema argument is required");
    if (!messageType) throw new Error("Message type argument is required");

    const root = protobuf.parse(schema).root;
    const type = root.lookupType(messageType);
    const decoded = type.decode(Buffer.from(input.value));
    const value = type.toObject(decoded, {
      longs: String,
      enums: String,
      defaults: true
    });
    return { type: "json", value };
  }
};
