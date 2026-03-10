import { describe, expect, it } from "vitest";
import { parseRecipeAny, parseArgs, parseInputValue, renderOutput, fileLeaf, renderBatchOutputFile } from "../src/main.js";

describe("cli helpers", () => {
  it("parses native recipes and CLI options", () => {
    const parsed = parseRecipeAny(JSON.stringify({ version: 1, steps: [] }), true);
    const opts = parseArgs([
      "recipe.json",
      "-",
      "--timeout-ms",
      "2500",
      "--show-summary",
      "--bytes-output",
      "utf8",
      "--json-indent",
      "4",
      "--batch-ext",
      ".txt,.log"
    ]);

    expect(parsed).toMatchObject({ source: "native", warningCount: 0 });
    expect(opts).toMatchObject({
      recipePath: "recipe.json",
      inputPath: "-",
      timeoutMs: 2500,
      showSummary: true,
      bytesOutput: "utf8",
      jsonIndent: 4,
      batchExt: [".txt", ".log"]
    });
  });

  it("parses input values for text, hex, and base64", () => {
    expect(parseInputValue("hello", { inputEncoding: "text" })).toEqual({
      type: "string",
      value: "hello"
    });
    expect(parseInputValue("6869", { inputEncoding: "hex" })).toEqual({
      type: "bytes",
      value: new Uint8Array([0x68, 0x69])
    });
    expect(parseInputValue("aGk=", { inputEncoding: "base64" })).toEqual({
      type: "bytes",
      value: new Uint8Array([0x68, 0x69])
    });
  });

  it("renders outputs in supported formats", () => {
    const baseOpts = {
      bytesOutput: "hex" as const,
      hexUppercase: true,
      jsonIndent: 2
    };

    expect(renderOutput({ type: "bytes", value: new Uint8Array([0xab, 0xcd]) }, baseOpts)).toBe(
      "ABCD"
    );
    expect(
      renderOutput(
        { type: "bytes", value: new Uint8Array([0x68, 0x69]) },
        { ...baseOpts, bytesOutput: "utf8" }
      )
    ).toBe("hi");
    expect(
      renderOutput({ type: "json", value: { a: 1 } }, { ...baseOpts, maxOutputChars: 6 })
    ).toBe('{\n  "a');
    expect(renderOutput({ type: "number", value: 42 }, baseOpts)).toBe("42");
  });

  it("renders batch outputs and file names", () => {
    const run = {
      rendered: "output",
      outputType: "string" as const,
      elapsed: 12,
      traceSummary: {
        steps: 1,
        totalDurationMs: 12,
        averageDurationMs: 12,
        slowestStep: { step: 0, opId: "demo", durationMs: 12 }
      }
    };

    expect(fileLeaf("/tmp/demo.txt")).toBe("demo.txt");
    expect(renderBatchOutputFile("/tmp/demo.txt", run, { batchOutputFormat: "text" })).toBe(
      "output\n"
    );
    expect(renderBatchOutputFile("/tmp/demo.txt", run, { batchOutputFormat: "jsonl" })).toContain(
      "\"file\":\"/tmp/demo.txt\""
    );
    expect(renderBatchOutputFile("/tmp/demo.txt", run, { batchOutputFormat: "json" })).toContain(
      "\"traceSummary\""
    );
  });
});
