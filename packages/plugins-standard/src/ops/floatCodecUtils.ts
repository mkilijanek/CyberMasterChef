import { parseNumberList } from "./numericListUtils.js";

export type FloatWidth = "float32" | "float64";
export type FloatEndianness = "big" | "little";

export function normalizeFloatWidth(value: unknown): FloatWidth {
  return value === "float64" ? "float64" : "float32";
}

export function normalizeEndianness(value: unknown): FloatEndianness {
  return value === "little" ? "little" : "big";
}

export function byteWidth(width: FloatWidth): number {
  return width === "float64" ? 8 : 4;
}

export function parseByteInput(value: string, delimiter: string): Uint8Array {
  const numbers = parseNumberList(value, delimiter);
  if (numbers.length === 0) {
    return new Uint8Array();
  }
  return Uint8Array.from(numbers, (entry) => {
    if (!Number.isInteger(entry) || entry < 0 || entry > 255) {
      throw new Error(`Byte value out of range: ${entry}`);
    }
    return entry;
  });
}

export function encodeFloats(
  values: number[],
  width: FloatWidth,
  endianness: FloatEndianness
): Uint8Array {
  const bytesPerValue = byteWidth(width);
  const view = new DataView(new ArrayBuffer(values.length * bytesPerValue));
  const littleEndian = endianness === "little";
  values.forEach((value, index) => {
    const offset = index * bytesPerValue;
    if (width === "float64") {
      view.setFloat64(offset, value, littleEndian);
      return;
    }
    view.setFloat32(offset, value, littleEndian);
  });
  return new Uint8Array(view.buffer);
}

export function decodeFloats(
  bytes: Uint8Array,
  width: FloatWidth,
  endianness: FloatEndianness
): number[] {
  const bytesPerValue = byteWidth(width);
  if (bytes.length % bytesPerValue !== 0) {
    throw new Error(`Input length must be a multiple of ${bytesPerValue} bytes`);
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const littleEndian = endianness === "little";
  const values: number[] = [];
  for (let offset = 0; offset < bytes.length; offset += bytesPerValue) {
    values.push(
      width === "float64"
        ? view.getFloat64(offset, littleEndian)
        : view.getFloat32(offset, littleEndian)
    );
  }
  return values;
}
