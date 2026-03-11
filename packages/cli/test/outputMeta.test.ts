import { describe, expect, it } from "vitest";
import { describeOutput } from "../src/outputMeta.js";

describe("output metadata helpers", () => {
  it("describes image byte outputs", () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(describeOutput({ type: "bytes", value: bytes }, "89504e470d0a1a0a")).toEqual({
      outputType: "bytes",
      charLength: 16,
      byteLength: 8,
      mediaType: "image/png",
      detectedFileType: "png",
      previewKind: "image"
    });
  });

  it("describes jpeg, gif, and webp byte outputs", () => {
    expect(
      describeOutput({ type: "bytes", value: new Uint8Array([0xff, 0xd8, 0xff]) }, "ffd8ff")
    ).toMatchObject({
      mediaType: "image/jpeg",
      detectedFileType: "jpeg",
      previewKind: "image"
    });
    expect(
      describeOutput({ type: "bytes", value: new Uint8Array([0x47, 0x49, 0x46, 0x38]) }, "47494638")
    ).toMatchObject({
      mediaType: "image/gif",
      detectedFileType: "gif",
      previewKind: "image"
    });
    expect(
      describeOutput(
        {
          type: "bytes",
          value: new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
        },
        "524946460000000057454250"
      )
    ).toMatchObject({
      mediaType: "image/webp",
      detectedFileType: "webp",
      previewKind: "image"
    });
  });

  it("describes non-image byte outputs", () => {
    expect(describeOutput({ type: "bytes", value: new Uint8Array([0xde, 0xad]) }, "dead")).toEqual({
      outputType: "bytes",
      charLength: 4,
      byteLength: 2,
      mediaType: null,
      detectedFileType: null,
      previewKind: "hex"
    });
  });

  it("describes json and svg-like string outputs", () => {
    expect(describeOutput({ type: "json", value: { ok: true } }, '{\n  "ok": true\n}')).toEqual({
      outputType: "json",
      charLength: 16,
      byteLength: null,
      mediaType: null,
      detectedFileType: null,
      previewKind: "json"
    });
    expect(describeOutput({ type: "string", value: "<svg></svg>" }, "<svg></svg>")).toEqual({
      outputType: "string",
      charLength: 11,
      byteLength: null,
      mediaType: "image/svg+xml",
      detectedFileType: "svg",
      previewKind: "text"
    });
    expect(
      describeOutput(
        { type: "string", value: '<?xml version="1.0"?><svg></svg>' },
        '<?xml version="1.0"?><svg></svg>'
      )
    ).toMatchObject({
      mediaType: "image/svg+xml",
      detectedFileType: "svg",
      previewKind: "text"
    });
    expect(describeOutput({ type: "number", value: 42 }, "42")).toEqual({
      outputType: "number",
      charLength: 2,
      byteLength: null,
      mediaType: null,
      detectedFileType: null,
      previewKind: "text"
    });
  });
});
