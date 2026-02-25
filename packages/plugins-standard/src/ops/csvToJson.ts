import type { Operation } from "@cybermasterchef/core";
import PapaRaw from "papaparse";

type PapaParseResult = {
  data: unknown[];
  errors: unknown[];
  meta: Record<string, unknown>;
};

type PapaParseConfig = {
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
};

type PapaModule = {
  parse: (input: string, config?: PapaParseConfig) => PapaParseResult;
};

const Papa = PapaRaw as unknown as PapaModule;

export const csvToJson: Operation = {
  id: "format.csvToJson",
  name: "CSV To JSON",
  description: "Parses CSV input into JSON data with parse metadata.",
  input: ["string"],
  output: "json",
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
    },
    {
      key: "skipEmptyLines",
      label: "Skip Empty Lines",
      type: "boolean",
      defaultValue: true
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : ",";
    const header = typeof args.header === "boolean" ? args.header : true;
    const skipEmptyLines =
      typeof args.skipEmptyLines === "boolean" ? args.skipEmptyLines : true;

    const result = Papa.parse(input.value, {
      delimiter,
      header,
      skipEmptyLines
    });

    return {
      type: "json",
      value: {
        data: result.data,
        errors: result.errors,
        meta: result.meta
      }
    };
  }
};
