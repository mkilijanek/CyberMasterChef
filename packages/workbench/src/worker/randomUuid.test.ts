import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUuid } from "./randomUuid";

describe("randomUuid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    vi.stubGlobal(
      "crypto",
      Object.assign(Object.create(globalThis.crypto ?? {}), {
        randomUUID: () => "uuid-from-crypto"
      })
    );

    expect(randomUuid()).toBe("uuid-from-crypto");
  });

  it("falls back to getRandomValues when randomUUID is missing", () => {
    vi.stubGlobal("crypto", {
      getRandomValues(bytes: Uint8Array) {
        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = index;
        }
        return bytes;
      }
    });

    expect(randomUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});
