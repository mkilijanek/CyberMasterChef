import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe } from "@cybermasterchef/core";
import type { Recipe } from "@cybermasterchef/core";
import { changeIpFormat } from "../src/ops/changeIpFormat.js";
import { extractMacAddresses } from "../src/ops/extractMacAddresses.js";
import { parseUserAgent } from "../src/ops/parseUserAgent.js";

describe("network parity wave", () => {
  it("extracts and normalizes unique MAC addresses", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractMacAddresses);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.extractMacAddresses" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "src aa-bb-cc-dd-ee-ff dup AABB.CCDD.EEFF other 11:22:33:44:55:66"
      }
    });

    expect(out.output).toEqual({
      type: "string",
      value: "aa:bb:cc:dd:ee:ff\n11:22:33:44:55:66"
    });
  });

  it("changes IPv4 formats deterministically", async () => {
    const registry = new InMemoryRegistry();
    registry.register(changeIpFormat);

    const toHex = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "network.changeIpFormat", args: { outputFormat: "hex" } }]
      },
      input: { type: "string", value: "192.168.0.1 3232235521" }
    });
    expect(toHex.output).toEqual({
      type: "string",
      value: "0xc0a80001\n0xc0a80001"
    });

    const toDotted = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "network.changeIpFormat" }] },
      input: { type: "string", value: "11000000101010000000000000000001" }
    });
    expect(toDotted.output).toEqual({ type: "string", value: "192.168.0.1" });

    const toBinary = await runRecipe({
      registry,
      recipe: {
        version: 1,
        steps: [{ opId: "network.changeIpFormat", args: { outputFormat: "binary" } }]
      },
      input: { type: "string", value: "192.168.0.1" }
    });
    expect(toBinary.output).toEqual({
      type: "string",
      value: "11000000101010000000000000000001"
    });
  });

  it("parses common user-agent families", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseUserAgent);

    const out = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "network.parseUserAgent" }] },
      input: {
        type: "string",
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
      }
    });

    expect(out.output).toEqual({
      type: "json",
      value: {
        raw:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        browser: { family: "Chrome", version: "140.0.0.0" },
        os: { family: "Windows", version: "10.0" },
        engine: "Blink",
        deviceType: "desktop"
      }
    });
  });

  it("covers helper and validation branches", () => {
    expect(() =>
      extractMacAddresses.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(
      extractMacAddresses.run({ input: { type: "string", value: "none" }, args: {} })
    ).toEqual({ type: "string", value: "" });

    expect(() =>
      changeIpFormat.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(
      changeIpFormat.run({ input: { type: "string", value: "" }, args: {} })
    ).toEqual({ type: "string", value: "" });
    expect(() =>
      changeIpFormat.run({ input: { type: "string", value: "999.1.1.1" }, args: {} })
    ).toThrow("Invalid IPv4 token: 999.1.1.1");
    expect(() =>
      changeIpFormat.run({ input: { type: "string", value: "4294967296" }, args: {} })
    ).toThrow("Invalid IPv4 token: 4294967296");
    expect(
      changeIpFormat.run({
        input: { type: "string", value: "0xc0a80001" },
        args: { outputFormat: "integer" }
      })
    ).toEqual({ type: "string", value: "3232235521" });

    expect(() =>
      parseUserAgent.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })
    ).toThrow("Expected string input");
    expect(() =>
      parseUserAgent.run({ input: { type: "string", value: "   " }, args: {} })
    ).toThrow("Expected user-agent input");
    expect(
      parseUserAgent.run({
        input: {
          type: "string",
          value:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Version/17.5 Mobile/15E148 Safari/604.1"
        },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Version/17.5 Mobile/15E148 Safari/604.1",
        browser: { family: "Safari", version: "17.5" },
        os: { family: "iOS", version: "17.5" },
        engine: "WebKit",
        deviceType: "mobile"
      }
    });
    expect(
      parseUserAgent.run({
        input: { type: "string", value: "ExampleBot/1.0" },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw: "ExampleBot/1.0",
        browser: { family: "Unknown", version: null },
        os: { family: "Unknown", version: null },
        engine: "Unknown",
        deviceType: "bot"
      }
    });
    expect(
      parseUserAgent.run({
        input: {
          type: "string",
          value:
            "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0"
        },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw: "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
        browser: { family: "Firefox", version: "135.0" },
        os: { family: "Linux", version: null },
        engine: "Gecko",
        deviceType: "desktop"
      }
    });
    expect(
      parseUserAgent.run({
        input: {
          type: "string",
          value:
            "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36"
        },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw:
          "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
        browser: { family: "Chrome", version: "140.0.0.0" },
        os: { family: "Android", version: "15" },
        engine: "Blink",
        deviceType: "mobile"
      }
    });
    expect(
      parseUserAgent.run({
        input: {
          type: "string",
          value:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
        },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        browser: { family: "Safari", version: "17.5" },
        os: { family: "macOS", version: "14.5" },
        engine: "WebKit",
        deviceType: "desktop"
      }
    });
    expect(
      parseUserAgent.run({
        input: {
          type: "string",
          value:
            "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) Version/17.5 Mobile/15E148 Safari/604.1"
        },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw:
          "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) Version/17.5 Mobile/15E148 Safari/604.1",
        browser: { family: "Safari", version: "17.5" },
        os: { family: "Unknown", version: null },
        engine: "WebKit",
        deviceType: "tablet"
      }
    });
    expect(
      parseUserAgent.run({
        input: {
          type: "string",
          value:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0"
        },
        args: {}
      })
    ).toEqual({
      type: "json",
      value: {
        raw:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        browser: { family: "Edge", version: "140.0.0.0" },
        os: { family: "Windows", version: "10.0" },
        engine: "Blink",
        deviceType: "desktop"
      }
    });
  });
});
