import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";
import PapaRaw from "papaparse";

type PapaUnparseConfig = {
  delimiter?: string;
  header?: boolean;
};

type PapaModule = {
  unparse: (input: unknown, config?: PapaUnparseConfig) => string;
};

const Papa = PapaRaw as unknown as PapaModule;

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const jsonToCsv: Operation = {
  id: "format.jsonToCsv",
  name: "JSON To CSV",
  description: "Serializes JSON arrays/objects into CSV text.",
  input: ["string", "json"],
  output: "string",
  args: [
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: ","
    },
    {
      key: "header",
      label: "Header Row",
      type: "boolean",
      defaultValue: true
    }
  ],
  run: ({ input, args }) => {
    let data: unknown;
    if (input.type === "string") {
      data = parseJson("format.jsonToCsv", input.value);
    } else if (input.type === "json") {
      data = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const delimiter = typeof args.delimiter === "string" ? args.delimiter : ",";
    const header = typeof args.header === "boolean" ? args.header : true;

    const value = Papa.unparse(data, {
      delimiter,
      header
    });

    return { type: "string", value };
  }
};
