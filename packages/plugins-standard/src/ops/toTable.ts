import type { Operation } from "@cybermasterchef/core";
import Papa from "papaparse";

type PapaParseResult = {
  data: unknown[];
};

type PapaParseConfig = {
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
};

type PapaModule = {
  parse: (input: string, config?: PapaParseConfig) => PapaParseResult;
};

const PapaTyped = Papa as unknown as PapaModule;

function stringifyRow(values: string[], widths: number[]): string {
  return values
    .map((value, index) => value.padEnd(widths[index] ?? value.length))
    .join(" | ");
}

export const toTable: Operation = {
  id: "format.toTable",
  name: "To Table",
  description: "Formats CSV input into an aligned table.",
  input: ["string"],
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
    if (input.type !== "string") throw new Error("Expected string input");
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : ",";
    const header = typeof args.header === "boolean" ? args.header : true;

    const result = PapaTyped.parse(input.value, {
      delimiter,
      header,
      skipEmptyLines: true
    });

    const rows: string[][] = [];
    if (header) {
      const first = result.data[0] as Record<string, unknown> | undefined;
      const columns = first ? Object.keys(first) : [];
      rows.push(columns);
      for (const row of result.data) {
        const record = row as Record<string, unknown>;
        rows.push(
          columns.map((col) => {
            const cell = record[col];
            if (cell === null || cell === undefined) return "";
            if (typeof cell === "string") return cell;
            if (typeof cell === "number" || typeof cell === "boolean") return String(cell);
            return JSON.stringify(cell);
          })
        );
      }
    } else {
      for (const row of result.data) {
        if (Array.isArray(row)) {
          rows.push(row.map((cell) => String(cell ?? "")));
        }
      }
    }

    if (rows.length === 0) return { type: "string", value: "" };

    const headerRow = rows[0] ?? [];
    const widths = headerRow.map((_, index) =>
      Math.max(...rows.map((row) => (row[index] ?? "").length))
    );

    const lines = rows.map((row) => stringifyRow(row, widths));
    return { type: "string", value: lines.join("\n") };
  }
};
