import { describe, expect, it } from "vitest";
import { createRegistryWithBuiltins } from "./builtins";

describe("createRegistryWithBuiltins", () => {
  it("excludes browser-unsafe operations from the workbench registry", () => {
    const registry = createRegistryWithBuiltins();

    expect(registry.get("image.generate")).toBeUndefined();
    expect(registry.get("format.avroEncode")).toBeUndefined();
    expect(registry.get("compression.gzip")).toBeUndefined();
    expect(registry.get("crypto.scrypt")).toBeUndefined();
    expect(registry.get("codec.toHex")).toBeDefined();
    expect(registry.get("text.rot47")).toBeDefined();
  });
});
