import { describe, expect, it } from "vitest";
import { describeOutputPresentation } from "./outputPresentation";

describe("output presentation helpers", () => {
  it("builds preview metadata for image bytes", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const out = describeOutputPresentation({ type: "bytes", value: png });
    expect(out.outputType).toBe("bytes");
    expect(out.byteLength).toBe(8);
    expect(out.mediaType).toBe("image/png");
    expect(out.detectedFileType).toBe("png");
    expect(out.previewKind).toBe("image");
    expect(out.previewSrc).toBe("data:image/png;base64,iVBORw0KGgo=");
    expect(out.text).toBe("89504e470d0a1a0a");
  });

  it("builds jpeg, gif, and webp previews", () => {
    const jpeg = describeOutputPresentation({ type: "bytes", value: new Uint8Array([0xff, 0xd8, 0xff]) });
    expect(jpeg.mediaType).toBe("image/jpeg");
    expect(jpeg.detectedFileType).toBe("jpeg");
    expect(jpeg.previewSrc).toBe("data:image/jpeg;base64,/9j/");

    const gif = describeOutputPresentation({ type: "bytes", value: new Uint8Array([0x47, 0x49, 0x46, 0x38]) });
    expect(gif.mediaType).toBe("image/gif");
    expect(gif.detectedFileType).toBe("gif");
    expect(gif.previewSrc).toBe("data:image/gif;base64,R0lGOA==");

    const webp = describeOutputPresentation({
      type: "bytes",
      value: new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
    });
    expect(webp.mediaType).toBe("image/webp");
    expect(webp.detectedFileType).toBe("webp");
    expect(webp.previewSrc).toBe("data:image/webp;base64,UklGRgAAAABXRUJQ");
  });

  it("keeps non-image bytes as hex and handles json/string values", () => {
    const hexOut = describeOutputPresentation({ type: "bytes", value: new Uint8Array([0xde, 0xad]) });
    expect(hexOut.previewKind).toBe("hex");
    expect(hexOut.previewSrc).toBeNull();
    expect(hexOut.text).toBe("dead");

    const jsonOut = describeOutputPresentation({ type: "json", value: { ok: true } });
    expect(jsonOut.previewKind).toBe("json");
    expect(jsonOut.text).toContain('"ok": true');

    const stringOut = describeOutputPresentation({ type: "string", value: "<svg></svg>" });
    expect(stringOut.mediaType).toBe("image/svg+xml");
    expect(stringOut.detectedFileType).toBe("svg");
    expect(stringOut.previewSrc).toBeNull();

    const xmlSvgOut = describeOutputPresentation({
      type: "string",
      value: '<?xml version="1.0"?><svg></svg>'
    });
    expect(xmlSvgOut.mediaType).toBe("image/svg+xml");
    expect(xmlSvgOut.detectedFileType).toBe("svg");
    expect(xmlSvgOut.previewSrc).toBeNull();

    const numberOut = describeOutputPresentation({ type: "number", value: 42 });
    expect(numberOut.text).toBe("42");
    expect(numberOut.charLength).toBe(2);
    expect(numberOut.mediaType).toBeNull();
  });
});
