import { bytesToBase64, type DataValue } from "@cybermasterchef/core";

export type OutputPresentation = {
  text: string;
  outputType: DataValue["type"];
  charLength: number;
  byteLength: number | null;
  mediaType: string | null;
  detectedFileType: string | null;
  previewKind: "text" | "json" | "hex" | "image";
  previewSrc: string | null;
};

function looksLikeSvgText(value: string): boolean {
  const trimmed = value.trimStart();
  return trimmed.startsWith("<svg") || (trimmed.startsWith("<?xml") && trimmed.includes("<svg"));
}

function detectBinaryFileType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function fileTypeToMediaType(fileType: string | null): string | null {
  switch (fileType) {
    case "png":
      return "image/png";
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return null;
  }
}

export function describeOutputPresentation(output: DataValue): OutputPresentation {
  if (output.type === "bytes") {
    const text = [...output.value].map((b) => b.toString(16).padStart(2, "0")).join("");
    const detectedFileType = detectBinaryFileType(output.value);
    const mediaType = fileTypeToMediaType(detectedFileType);
    return {
      text,
      outputType: output.type,
      charLength: text.length,
      byteLength: output.value.length,
      mediaType,
      detectedFileType,
      previewKind: mediaType !== null ? "image" : "hex",
      previewSrc: mediaType !== null ? `data:${mediaType};base64,${bytesToBase64(output.value)}` : null
    };
  }
  if (output.type === "json") {
    const text = JSON.stringify(output.value, null, 2);
    return {
      text,
      outputType: output.type,
      charLength: text.length,
      byteLength: null,
      mediaType: null,
      detectedFileType: null,
      previewKind: "json",
      previewSrc: null
    };
  }
  const stringValue = String(output.value);
  const detectedFileType = output.type === "string" && looksLikeSvgText(stringValue) ? "svg" : null;
  return {
    text: stringValue,
    outputType: output.type,
    charLength: stringValue.length,
    byteLength: null,
    mediaType: fileTypeToMediaType(detectedFileType),
    detectedFileType,
    previewKind: "text",
    previewSrc: null
  };
}
