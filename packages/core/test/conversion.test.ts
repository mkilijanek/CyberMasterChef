import { describe, expect, it } from "vitest";
import { coerceToAnyOf } from "../src/conversion.js";

describe("conversion", () => {
  it("keeps value when type is already allowed", () => {
    const out = coerceToAnyOf({ type: "string", value: "abc" }, ["string", "bytes"]);
    expect(out).toEqual({ type: "string", value: "abc" });
  });

  it("falls back to next compatible type in allowed list", () => {
    const out = coerceToAnyOf({ type: "number", value: 42 }, ["json", "string"]);
    expect(out).toEqual({ type: "string", value: "42" });
  });
});
