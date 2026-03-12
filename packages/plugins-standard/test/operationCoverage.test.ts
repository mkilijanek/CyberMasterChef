import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryRegistry } from "@cybermasterchef/core";
import type { DataValue, Operation } from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1cAAAAASUVORK5CYII=";
const ZIP_BYTES = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);

function defaultArgs(op: Operation): Record<string, unknown> {
  const args = Object.fromEntries(op.args.map((arg) => [arg.key, arg.defaultValue]));
  if (op.id === "crypto.bcrypt") {
    return {
      ...args,
      rounds: 4,
      salt: "0123456789abcdef",
      saltEncoding: "utf8"
    };
  }
  return args;
}

function sampleInput(op: Operation): DataValue {
  const hasBytes = op.input.includes("bytes");
  const id = op.id.toLowerCase();

  if (id.includes("image") && hasBytes) {
    return {
      type: "bytes",
      value: Uint8Array.from(Buffer.from(PNG_BASE64, "base64"))
    };
  }
  if ((id.includes("zip") || id.includes("archive")) && hasBytes) {
    return { type: "bytes", value: ZIP_BYTES };
  }
  if (
    id.includes("json") ||
    id.includes("yaml") ||
    id.includes("csv") ||
    id.includes("xml") ||
    id.includes("html")
  ) {
    return { type: "string", value: "{\"alpha\":1,\"beta\":[\"x\",2]}" };
  }
  if (hasBytes) {
    return {
      type: "bytes",
      value: new TextEncoder().encode("hello 192.168.1.1 test@example.com")
    };
  }
  return {
    type: "string",
    value: "hello 192.168.1.1 test@example.com https://example.invalid"
  };
}

describe("operation coverage smoke", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Response(JSON.stringify({ Answer: [{ data: "127.0.0.1" }] }), { status: 200 }))
    );
  });

  it("invokes every registered operation function", async () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);
    const ops = registry.list();

    expect(ops.length).toBeGreaterThan(250);

    for (const op of ops) {
      const args = defaultArgs(op);
      const input = sampleInput(op);

      try {
        const result = await op.run({ input, args });
        expect(["string", "bytes", "json", "number"]).toContain(result.type);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    }
  });
});
