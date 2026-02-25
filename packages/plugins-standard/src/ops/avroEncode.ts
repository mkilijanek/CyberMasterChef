import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const avroEncode: Operation = {
  id: "format.avroEncode",
  name: "Avro Encode",
  description: "Encodes JSON into Avro binary using a provided schema.",
  input: ["string", "json"],
  output: "bytes",
  args: [
    {
      key: "schema",
      label: "Schema (JSON)",
      type: "string",
      defaultValue: ""
    }
  ],
  run: async ({ input, args }) => {
    const schemaRaw = typeof args.schema === "string" ? args.schema : "";
    if (!schemaRaw) throw new Error("Schema argument is required");

    const schema = parseJson("format.avroEncode", schemaRaw);
    const { Type } = (await import("avsc")) as {
      Type: { forSchema: (schema: unknown) => { toBuffer: (value: unknown) => Buffer } };
    };
    const type = Type.forSchema(schema);

    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.avroEncode", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const encoded = type.toBuffer(payload);
    return { type: "bytes", value: new Uint8Array(encoded) };
  }
};
