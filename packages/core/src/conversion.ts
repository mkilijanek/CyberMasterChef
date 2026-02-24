import type { DataValue, ValueType } from "./types.js";
import { ConversionError } from "./errors.js";
import { bytesToUtf8, utf8ToBytes } from "./utils/bytes.js";

export function coerce(value: DataValue, to: ValueType): DataValue {
  if (value.type === to) return value;
  if (value.type === "string" && to === "bytes") {
    return { type: "bytes", value: utf8ToBytes(value.value) };
  }
  if (value.type === "bytes" && to === "string") {
    return { type: "string", value: bytesToUtf8(value.value) };
  }
  if (value.type === "string" && to === "json") {
    return { type: "json", value: JSON.parse(value.value) as unknown };
  }
  if (value.type === "json" && to === "string") {
    return { type: "string", value: JSON.stringify(value.value, null, 2) };
  }
  if (value.type === "number" && to === "string") {
    return { type: "string", value: String(value.value) };
  }
  if (value.type === "string" && to === "number") {
    const n = Number(value.value);
    if (!Number.isFinite(n)) throw new ConversionError("string", "number");
    return { type: "number", value: n };
  }
  throw new ConversionError(value.type, to);
}

export function coerceToAnyOf(value: DataValue, allowed: ValueType[]): DataValue {
  if (allowed.includes(value.type)) return value;
  for (const t of allowed) {
    try {
      return coerce(value, t);
    } catch {
      // try next
    }
  }
  throw new ConversionError(value.type, allowed.join("|"));
}
