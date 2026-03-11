import { describe, expect, it } from "vitest";
import type { DataValue } from "@cybermasterchef/core";
import { inputToBytes, extractPrintableStrings } from "../src/ops/forensicUtils.js";
import { entropy } from "../src/ops/entropy.js";
import { ctph } from "../src/ops/ctph.js";
import { detectFileType } from "../src/ops/detectFileType.js";
import { generateUuid } from "../src/ops/generateUuid.js";
import { fileTree } from "../src/ops/fileTree.js";
import { yaraRules } from "../src/ops/yaraRules.js";

describe("forensic coverage helpers", () => {
  it("covers unsupported forensic helper input and empty printable extraction", () => {
    expect(() =>
      inputToBytes({ type: "json", value: { ok: true } } as unknown as DataValue)
    ).toThrow("Expected bytes or string input");
    expect(extractPrintableStrings("", 4)).toEqual([]);
  });

  it("covers entropy without segmentation and empty CTPH input", () => {
    const entropyOut = entropy.run({
      input: { type: "string", value: "AAAA" },
      args: {},
      signal: new AbortController().signal
    });
    expect(entropyOut).toEqual({
      type: "json",
      value: {
        sizeBytes: 4,
        overallEntropy: 0,
        distinctByteCount: 1,
        segmentSize: 0,
        segments: []
      }
    });

    const ctphOut = ctph.run({
      input: { type: "bytes", value: new Uint8Array() },
      args: {},
      signal: new AbortController().signal
    });
    expect(ctphOut).toEqual({ type: "string", value: "" });
  });

  it("covers UUID error branches", async () => {
    await expect(
      generateUuid.run({
        input: { type: "string", value: "name" },
        args: { version: "v5" },
        signal: new AbortController().signal
      })
    ).rejects.toThrow("namespace is required for UUID v5 generation");

    await expect(
      generateUuid.run({
        input: { type: "string", value: "name" },
        args: { version: "v5", namespace: "invalid" },
        signal: new AbortController().signal
      })
    ).rejects.toThrow("Expected RFC4122 UUID namespace");
  });

  it("covers file-tree path variants and file-to-directory promotion", async () => {
    const out = await fileTree.run({
      input: {
        type: "json",
        value: { files: [{ path: "sample" }, { path: "sample/nested.txt" }] }
      },
      args: {},
      signal: new AbortController().signal
    });
    expect(out.type).toBe("json");
    if (out.type !== "json") return;
    expect(out.value).toMatchObject({
      pathCount: 2,
      paths: ["sample", "sample/nested.txt"]
    });
    const tree = (out.value as { tree: Array<{ name: string; type: string }> }).tree;
    expect(tree[0]).toMatchObject({ name: "sample", type: "directory" });
  });

  it("covers file-tree fallback for unsupported object shapes", async () => {
    const out = await fileTree.run({
      input: { type: "json", value: { unsupported: true } },
      args: {},
      signal: new AbortController().signal
    });
    expect(out).toEqual({ type: "json", value: { pathCount: 0, paths: [], tree: [] } });
  });

  it("covers YARA rule-name fallback and empty-string fallback condition", async () => {
    const out = await yaraRules.run({
      input: { type: "bytes", value: new Uint8Array([0, 1, 2]) },
      args: { ruleName: "   ", maxStrings: 0, minStringLength: 0 },
      signal: new AbortController().signal
    });
    expect(out.type).toBe("string");
    if (out.type !== "string") return;
    expect(out.value).toContain("rule generated_rule {");
    expect(out.value).toContain("filesize >= 0");
  });

  it("covers remaining detect-file-type signatures and errors", () => {
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x4d, 0x5a]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "pe" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x7f, 0x45, 0x4c, 0x46]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "elf" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x25, 0x50, 0x44, 0x46]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "pdf" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0xff, 0xd8, 0xff]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "jpeg" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x47, 0x49, 0x46, 0x38]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "gif" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x50, 0x4b, 0x03, 0x04]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "zip" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x50, 0x4b, 0x05, 0x06]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "zip" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x50, 0x4b, 0x07, 0x08]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "zip" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x1f, 0x8b]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "gzip" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x41, 0x42, 0x43]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "text" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array() },
        args: {}
      })
    ).toEqual({ type: "string", value: "unknown" });
    expect(
      detectFileType.run({
        input: {
          type: "bytes",
          value: new Uint8Array([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x73])
        },
        args: {}
      })
    ).toEqual({ type: "string", value: "avif" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x4d, 0x4d, 0x00, 0x2a]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "tiff" });
    expect(
      detectFileType.run({
        input: { type: "string", value: '<?xml version="1.0"?><svg></svg>' },
        args: {}
      })
    ).toEqual({ type: "string", value: "svg" });
    expect(
      detectFileType.run({
        input: { type: "bytes", value: new Uint8Array([0x00, 0x01, 0x02]) },
        args: {}
      })
    ).toEqual({ type: "string", value: "unknown" });
    expect(() =>
      detectFileType.run({
        input: { type: "json", value: {} } as never,
        args: {}
      })
    ).toThrow("Expected bytes or string input");
  });
});
