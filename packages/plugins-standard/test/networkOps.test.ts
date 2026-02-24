import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { extractIPs } from "../src/ops/extractIPs.js";
import { extractUrls } from "../src/ops/extractUrls.js";

describe("network operations", () => {
  it("extracts unique valid IPv4 addresses", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractIPs);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.extractIPs" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "10.0.0.1 bad=300.0.0.1 10.0.0.1 host 192.168.1.5 010.0.0.1"
      }
    });

    expect(out.output).toEqual({ type: "string", value: "10.0.0.1\n192.168.1.5" });
  });

  it("extracts unique HTTP/HTTPS URLs", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractUrls);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.extractUrls" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value:
          "visit https://example.com/a?b=1 and http://test.local/path; dup=https://example.com/a?b=1"
      }
    });

    expect(out.output).toEqual({
      type: "string",
      value: "https://example.com/a?b=1\nhttp://test.local/path"
    });
  });
});
