import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const avroDecode: Operation = {
  id: "format.avroDecode",
  name: "Avro Decode",
  description: "Decodes Avro binary into JSON using a provided schema.",
  input: ["bytes"],
  output: "json",
  args: [
    {
      key: "schema",
      label: "Schema (JSON)",
      type: "string",
      defaultValue: ""
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const schemaRaw = typeof args.schema === "string" ? args.schema : "";
    if (!schemaRaw) throw new Error("Schema argument is required");

    const schema = parseJson("format.avroDecode", schemaRaw);
    const { Type } = (await import("avsc")) as {
      Type: {
        forSchema: (schema: unknown) => { fromBuffer: (value: Buffer) => unknown };
      };
    };
    const type = Type.forSchema(schema);

    try {
      const value = type.fromBuffer(Buffer.from(input.value)) as unknown;
      return { type: "json", value };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to decode Avro input: ${reason}`, { cause: error });
    }
  }
};
