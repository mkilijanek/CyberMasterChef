import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { extractIPs } from "../src/ops/extractIPs.js";
import { extractUrls } from "../src/ops/extractUrls.js";
import { defangUrls } from "../src/ops/defangUrls.js";
import { fangUrls } from "../src/ops/fangUrls.js";
import { extractIPv6 } from "../src/ops/extractIPv6.js";

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

  it("defangs URL protocol and host dots", async () => {
    const registry = new InMemoryRegistry();
    registry.register(defangUrls);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.defangUrls" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "Check https://example.com/path?q=a.b#frag now" }
    });

    expect(out.output).toEqual({
      type: "string",
      value: "Check hxxps://example[.]com/path?q=a.b#frag now"
    });
  });

  it("fangs defanged URL markers", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fangUrls);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.fangUrls" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hxxps://ioc[.]example[.]com/path?q=1" }
    });

    expect(out.output).toEqual({
      type: "string",
      value: "https://ioc.example.com/path?q=1"
    });
  });

  it("extracts unique IPv6 address candidates", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractIPv6);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.extractIPv6" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "src=2001:0db8:0000:0000:0000:ff00:0042:8329 dup=2001:db8:0:0:0:ff00:42:8329"
      }
    });

    expect(out.output).toEqual({
      type: "string",
      value: "2001:0db8:0000:0000:0000:ff00:0042:8329\n2001:db8:0:0:0:ff00:42:8329"
    });
  });
});
