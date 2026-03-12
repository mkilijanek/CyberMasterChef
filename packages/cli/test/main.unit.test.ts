import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  parseRecipeAny,
  parseArgs,
  parseInputValue,
  renderOutput,
  fileLeaf,
  renderBatchOutputFile,
  extractTriageEvidenceBundle,
  main
} from "../src/main.js";

const stdoutWrite = vi.spyOn(process.stdout, "write");
const stderrWrite = vi.spyOn(process.stderr, "write");
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(here);
const repoRoot = dirname(dirname(packageRoot));
const sourceEntry = join(packageRoot, "src", "main.ts");
const packageVersion = (
  JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf-8")) as { version: string }
).version;

afterEach(() => {
  stdoutWrite.mockReset();
  stderrWrite.mockReset();
});

describe("cli helpers", () => {
  it("parses native recipes and CLI options", () => {
    const parsed = parseRecipeAny(JSON.stringify({ version: 1, steps: [] }), true);
    const opts = parseArgs([
      "recipe.json",
      "-",
      "--timeout-ms",
      "2500",
      "--show-summary",
      "--triage-bundle-file",
      "triage-bundle.json",
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
      triageBundleFile: "triage-bundle.json",
      bytesOutput: "utf8",
      jsonIndent: 4,
      batchExt: [".txt", ".log"]
    });
  });

  it("parses extended trace, repro, batch, and output options", () => {
    const opts = parseArgs([
      "recipe.json",
      "input.txt",
      "--show-trace",
      "--trace-json",
      "--trace-limit",
      "3",
      "--show-trace-summary",
      "--trace-summary-json",
      "--show-repro",
      "--repro-json",
      "--repro-file",
      "repro.json",
      "--output-file",
      "out.txt",
      "--input-encoding",
      "base64",
      "--bytes-output",
      "base64",
      "--hex-uppercase",
      "--max-output-chars",
      "10",
      "--batch-input-dir",
      "batch",
      "--batch-report-file",
      "report.json",
      "--batch-summary-json",
      "--batch-output-dir",
      "batch-out",
      "--batch-output-format",
      "jsonl",
      "--batch-max-files",
      "5",
      "--batch-concurrency",
      "4",
      "--batch-skip-empty",
      "--batch-fail-empty",
      "--batch-fail-fast",
      "--batch-continue-on-error",
      "--fail-empty-output",
      "--no-newline"
    ]);

    expect(opts).toMatchObject({
      recipePath: "recipe.json",
      inputPath: "input.txt",
      showTrace: true,
      traceJson: true,
      traceLimit: 3,
      showTraceSummary: true,
      traceSummaryJson: true,
      showRepro: true,
      reproJson: true,
      reproFile: "repro.json",
      outputFile: "out.txt",
      inputEncoding: "base64",
      bytesOutput: "base64",
      hexUppercase: true,
      maxOutputChars: 10,
      batchInputDir: "batch",
      batchReportFile: "report.json",
      batchSummaryJson: true,
      batchOutputDir: "batch-out",
      batchOutputFormat: "jsonl",
      batchMaxFiles: 5,
      batchConcurrency: 4,
      batchSkipEmpty: true,
      batchFailEmpty: true,
      batchFailFast: false,
      failEmptyOutput: true,
      noNewline: true
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
      outputMeta: {
        outputType: "string" as const,
        charLength: 6,
        byteLength: null,
        mediaType: null,
        detectedFileType: null,
        previewKind: "text" as const
      },
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

  it("extracts triage evidence bundles from string outputs", () => {
    expect(
      extractTriageEvidenceBundle({
        type: "string",
        value: JSON.stringify({ evidenceBundle: { schemaVersion: 1, bundleId: "triage-bundle--1" } })
      })
    ).toEqual({ schemaVersion: 1, bundleId: "triage-bundle--1" });
    expect(extractTriageEvidenceBundle({ type: "string", value: "not-json" })).toBeNull();
    expect(extractTriageEvidenceBundle({ type: "json", value: { evidenceBundle: true } })).toBeNull();
    expect(
      extractTriageEvidenceBundle({ type: "string", value: JSON.stringify({ evidenceBundle: "bad" }) })
    ).toBeNull();
  });

  it("fails on invalid CLI argument values and unknown options", () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((code?: string | number | null) => {
        throw new Error(`exit:${String(code ?? 0)}`);
      }) as typeof process.exit);
    try {
      expect(() => parseArgs(["recipe.json", "--input-encoding", "weird"])).toThrow("exit:1");
      expect(() => parseArgs(["recipe.json", "--batch-output-format", "yaml"])).toThrow("exit:1");
      expect(() => parseArgs(["recipe.json", "--timeout-ms", "0"])).toThrow("exit:1");
      expect(() => parseArgs(["recipe.json", "--unknown"])).toThrow("exit:1");
      const stderr = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderr).toContain("Invalid --input-encoding value: weird");
      expect(stderr).toContain("Invalid --batch-output-format value: yaml");
      expect(stderr).toContain("Invalid --timeout-ms value: 0");
      expect(stderr).toContain("Unknown option: --unknown");
    } finally {
      exitSpy.mockRestore();
    }
  });

  it("writes triage evidence bundle files from CLI execution", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      const inputPath = join(dir, "input.txt");
      const outputPath = join(dir, "output.json");
      const bundlePath = join(dir, "triage-bundle.json");
      writeFileSync(
        recipePath,
        JSON.stringify({ version: 1, steps: [{ opId: "forensic.basicTriage" }] }),
        "utf-8"
      );
      writeFileSync(inputPath, "https://example.com CVE-2024-12345 admin@example.com", "utf-8");

      await main([
        recipePath,
        inputPath,
        "--output-file",
        outputPath,
        "--triage-bundle-file",
        bundlePath
      ]);

      const bundle = JSON.parse(readFileSync(bundlePath, "utf-8")) as {
        schemaVersion: number;
        provenance: { derivedIndicators: Array<{ value: string }> };
      };
      expect(bundle.schemaVersion).toBe(1);
      expect(bundle.provenance.derivedIndicators.some((indicator) => indicator.value === "https://example.com")).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("lists operations and exits cleanly", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((code?: string | number | null) => {
        throw new Error(`exit:${String(code ?? 0)}`);
      }) as typeof process.exit);
    try {
      await expect(main(["--list-ops", "--list-ops-filter", "toHex"])).rejects.toThrow("exit:0");
      const stdout = stdoutWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stdout).toContain("codec.toHex");
      expect(stdout).not.toContain("forensic.basicTriage");
    } finally {
      exitSpy.mockRestore();
    }
  });

  it("supports dry-run and recipe source reporting", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      const inputPath = join(dir, "input.txt");
      writeFileSync(recipePath, JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }), "utf-8");
      writeFileSync(inputPath, "abc", "utf-8");

      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(((code?: string | number | null) => {
          throw new Error(`exit:${String(code ?? 0)}`);
        }) as typeof process.exit);
      try {
        await expect(
          main([recipePath, inputPath, "--print-recipe-source", "--dry-run"])
        ).rejects.toThrow("exit:0");
      } finally {
        exitSpy.mockRestore();
      }

      const stderr = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderr).toContain("[info] recipe-source=native");
      expect(stderr).toContain("[dry-run] steps=1 source=native warnings=0");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails when triage bundle export is requested for non-triage output", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      const inputPath = join(dir, "input.txt");
      const bundlePath = join(dir, "bundle.json");
      writeFileSync(recipePath, JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }), "utf-8");
      writeFileSync(inputPath, "abc", "utf-8");

      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(((code?: string | number | null) => {
          throw new Error(`exit:${String(code ?? 0)}`);
        }) as typeof process.exit);
      try {
        await expect(main([recipePath, inputPath, "--triage-bundle-file", bundlePath])).rejects.toThrow(
          "exit:1"
        );
      } finally {
        exitSpy.mockRestore();
      }

      const stderr = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderr).toContain("Execution output does not contain a triage evidence bundle.");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes summary, trace, repro, and output artifacts", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      const inputPath = join(dir, "input.txt");
      const outputPath = join(dir, "output.txt");
      const reproPath = join(dir, "repro.json");
      writeFileSync(recipePath, JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }), "utf-8");
      writeFileSync(inputPath, "abc", "utf-8");

      await main([
        recipePath,
        inputPath,
        "--output-file",
        outputPath,
        "--repro-file",
        reproPath,
        "--show-summary",
        "--summary-json",
        "--show-trace",
        "--trace-json",
        "--trace-limit",
        "1",
        "--show-trace-summary",
        "--trace-summary-json",
        "--show-repro",
        "--repro-json",
        "--no-newline"
      ]);

      expect(readFileSync(outputPath, "utf-8")).toBe("616263");
      const repro = JSON.parse(readFileSync(reproPath, "utf-8")) as { recipeSource: string; traceSteps: number };
      expect(repro.recipeSource).toBe("native");
      expect(repro.traceSteps).toBe(1);

      const stderr = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderr).toContain("[summary] outputType=string traceSteps=1");
      expect(stderr).toContain("\"outputType\":\"string\"");
      expect(stderr).toContain("[trace] step=1 op=codec.toHex");
      expect(stderr).toContain("\"opId\":\"codec.toHex\"");
      expect(stderr).toContain("[trace-summary] steps=1");
      expect(stderr).toContain("\"steps\":1");
      expect(stderr).toContain("[repro] recipeHash=");
      expect(stderr).toContain("\"recipeSource\":\"native\"");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("includes output metadata in CLI summaries, repro, and batch reports", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      const inputPath = join(dir, "input.txt");
      const reproPath = join(dir, "repro.json");
      const batchDir = join(dir, "batch");
      const reportPath = join(dir, "report.json");
      mkdirSync(batchDir, { recursive: true });
      writeFileSync(
        recipePath,
        JSON.stringify({
          version: 1,
          steps: [{ opId: "image.generate", args: { width: 2, height: 2, color: "#00ff00" } }]
        }),
        "utf-8"
      );
      writeFileSync(inputPath, "ignored", "utf-8");
      writeFileSync(join(batchDir, "a.txt"), "ignored", "utf-8");

      await main([
        recipePath,
        inputPath,
        "--show-summary",
        "--summary-json",
        "--repro-file",
        reproPath
      ]);

      const repro = JSON.parse(readFileSync(reproPath, "utf-8")) as {
        outputMeta: { previewKind: string; mediaType: string; byteLength: number };
      };
      expect(repro.outputMeta.previewKind).toBe("image");
      expect(repro.outputMeta.mediaType).toBe("image/png");
      expect(repro.outputMeta.byteLength).toBeGreaterThan(0);

      const stderrSingle = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderrSingle).toContain("[output-meta] preview=image");
      expect(stderrSingle).toContain('"mediaType":"image/png"');

      stdoutWrite.mockReset();
      stderrWrite.mockReset();
      await main([
        recipePath,
        "--batch-input-dir",
        batchDir,
        "--batch-report-file",
        reportPath
      ]);

      const report = JSON.parse(readFileSync(reportPath, "utf-8")) as Array<{
        outputMeta: { previewKind: string; mediaType: string; byteLength: number };
      }>;
      expect(report[0]?.outputMeta.previewKind).toBe("image");
      expect(report[0]?.outputMeta.mediaType).toBe("image/png");
      expect(report[0]?.outputMeta.byteLength).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("lists operations as JSON", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((code?: string | number | null) => {
        throw new Error(`exit:${String(code ?? 0)}`);
      }) as typeof process.exit);
    try {
      await expect(main(["--list-ops-json", "--list-ops-filter", "toHex"])).rejects.toThrow("exit:0");
      const stdout = stdoutWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stdout).toContain("\"id\":\"codec.toHex\"");
    } finally {
      exitSpy.mockRestore();
    }
  });

  it("fails on empty rendered output when requested", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      const inputPath = join(dir, "input.txt");
      writeFileSync(
        recipePath,
        JSON.stringify({ version: 1, steps: [{ opId: "text.removeLetters" }] }),
        "utf-8"
      );
      writeFileSync(inputPath, "abc", "utf-8");

      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(((code?: string | number | null) => {
          throw new Error(`exit:${String(code ?? 0)}`);
        }) as typeof process.exit);
      try {
        await expect(main([recipePath, inputPath, "--fail-empty-output"])).rejects.toThrow("exit:1");
      } finally {
        exitSpy.mockRestore();
      }

      const stderr = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderr).toContain("Execution failed: output is empty.");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes batch summary/report artifacts with output files", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const batchDir = join(dir, "batch");
      const reportPath = join(dir, "report.json");
      const batchOutDir = join(dir, "out");
      const recipePath = join(dir, "recipe.json");
      mkdirSync(batchDir, { recursive: true });
      mkdirSync(batchOutDir, { recursive: true });
      writeFileSync(
        recipePath,
        JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }),
        "utf-8"
      );
      writeFileSync(join(batchDir, "a.txt"), "abc", "utf-8");
      writeFileSync(join(batchDir, "b.txt"), "xyz", "utf-8");

      await main([
        recipePath,
        "--batch-input-dir",
        batchDir,
        "--batch-report-file",
        reportPath,
        "--batch-summary-json",
        "--batch-output-dir",
        batchOutDir,
        "--batch-output-format",
        "json",
        "--batch-ext",
        ".txt"
      ]);

      const report = JSON.parse(readFileSync(reportPath, "utf-8")) as Array<{
        file: string;
        ok: boolean;
        outputPreview?: string;
        outputType: string;
      }>;
      expect(report).toHaveLength(2);
      expect(report.every((row) => row.ok)).toBe(true);
      expect(report.map((row) => row.file)).toEqual([
        join(batchDir, "a.txt"),
        join(batchDir, "b.txt")
      ]);
      expect(report.map((row) => row.outputPreview)).toEqual(["616263", "78797a"]);
      expect(report.map((row) => row.outputType)).toEqual(["string", "string"]);

      const batchA = JSON.parse(readFileSync(join(batchOutDir, "a.txt.out.json"), "utf-8")) as {
        file: string;
        output: string;
      };
      const batchB = JSON.parse(readFileSync(join(batchOutDir, "b.txt.out.json"), "utf-8")) as {
        file: string;
        output: string;
      };
      expect(batchA).toMatchObject({ file: join(batchDir, "a.txt"), output: "616263" });
      expect(batchB).toMatchObject({ file: join(batchDir, "b.txt"), output: "78797a" });

      const stderr = stderrWrite.mock.calls.map((call) => String(call[0])).join("");
      expect(stderr).toContain("\"filesTotal\":2");
      expect(stderr).toContain("\"filesOk\":2");
      expect(stderr).toContain("\"filesFailed\":0");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("covers batch skip-empty, read-error, and fail-fast branches", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const batchDir = join(dir, "batch");
      const reportPath = join(dir, "report.json");
      const recipePath = join(dir, "recipe.json");
      mkdirSync(batchDir, { recursive: true });
      mkdirSync(join(batchDir, "folder"), { recursive: true });
      writeFileSync(
        recipePath,
        JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }),
        "utf-8"
      );
      writeFileSync(join(batchDir, "a.txt"), "", "utf-8");
      writeFileSync(join(batchDir, "b.txt"), "abc", "utf-8");

      await main([
        recipePath,
        "--batch-input-dir",
        batchDir,
        "--batch-report-file",
        reportPath,
        "--batch-summary-json",
        "--batch-skip-empty",
        "--batch-concurrency",
        "2"
      ]);

      const report = JSON.parse(readFileSync(reportPath, "utf-8")) as Array<{
        file: string;
        ok: boolean;
        error?: string;
      }>;
      expect(report).toHaveLength(3);
      expect(report).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: join(batchDir, "a.txt"),
            ok: true,
            error: "Skipped empty input file"
          }),
          expect.objectContaining({
            file: join(batchDir, "b.txt"),
            ok: true
          }),
          expect.objectContaining({
            file: join(batchDir, "folder"),
            ok: false,
            error: expect.stringContaining("Failed to read or process input file:")
          })
        ])
      );

      writeFileSync(join(batchDir, "0-empty.txt"), "", "utf-8");
      writeFileSync(join(batchDir, "1-ok.txt"), "abc", "utf-8");
      await main([
        recipePath,
        "--batch-input-dir",
        batchDir,
        "--batch-report-file",
        reportPath,
        "--batch-fail-empty",
        "--batch-fail-fast",
        "--batch-ext",
        ".txt"
      ]);

      const failFastReport = JSON.parse(readFileSync(reportPath, "utf-8")) as Array<{
        file: string;
        ok: boolean;
        error?: string;
      }>;
      expect(failFastReport).toHaveLength(1);
      expect(failFastReport[0]).toMatchObject({
        file: join(batchDir, "0-empty.txt"),
        ok: false,
        error: "Empty input file"
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("supports stdin input and stdout output via executable entrypoint", { timeout: 15000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "cmc-cli-"));
    try {
      const recipePath = join(dir, "recipe.json");
      writeFileSync(
        recipePath,
        JSON.stringify({ version: 1, steps: [{ opId: "codec.toHex" }] }),
        "utf-8"
      );

      const run = spawnSync("node", ["--import", "tsx", sourceEntry, recipePath], {
        cwd: repoRoot,
        encoding: "utf-8",
        input: "abc",
        env: {
          ...process.env,
          TSX_TSCONFIG_PATH: join(repoRoot, "tsconfig.base.json")
        }
      });

      expect(run.status).toBe(0);
      expect(run.stdout).toBe("616263\n");
      expect(run.stderr).toBe("");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("supports executable bootstrap with --version", { timeout: 15000 }, () => {
    const run = spawnSync("node", ["--import", "tsx", sourceEntry, "--version"], {
      cwd: repoRoot,
      encoding: "utf-8",
      env: {
        ...process.env,
        TSX_TSCONFIG_PATH: join(repoRoot, "tsconfig.base.json")
      }
    });

    expect(run.status).toBe(0);
    expect(run.stdout.trim()).toBe(packageVersion);
  });
});
