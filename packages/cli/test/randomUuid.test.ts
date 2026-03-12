import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUuid } from "../src/randomUuid.js";

describe("cli randomUuid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    vi.stubGlobal(
      "crypto",
      Object.assign(Object.create(globalThis.crypto ?? {}), {
        randomUUID: () => "cli-uuid-from-crypto"
      })
    );

    expect(randomUuid()).toBe("cli-uuid-from-crypto");
  });

  it("falls back to getRandomValues when randomUUID is missing", () => {
    vi.stubGlobal("crypto", {
      getRandomValues(bytes: Uint8Array) {
        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = index + 1;
        }
        return bytes;
      }
    });

    expect(randomUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});
