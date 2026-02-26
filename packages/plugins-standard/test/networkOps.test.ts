import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { extractIPs } from "../src/ops/extractIPs.js";
import { extractUrls } from "../src/ops/extractUrls.js";
import { defangUrls } from "../src/ops/defangUrls.js";
import { fangUrls } from "../src/ops/fangUrls.js";
import { extractIPv6 } from "../src/ops/extractIPv6.js";
import { defangIPs } from "../src/ops/defangIPs.js";
import { fangIPs } from "../src/ops/fangIPs.js";
import { extractPorts } from "../src/ops/extractPorts.js";
import { dechunkHttpResponse } from "../src/ops/dechunkHttpResponse.js";
import { groupIPAddresses } from "../src/ops/groupIPAddresses.js";

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

  it("defangs IPv4 addresses in text", async () => {
    const registry = new InMemoryRegistry();
    registry.register(defangIPs);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.defangIPs" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "src 10.0.0.1 dst 192.168.1.5" }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "src 10[.]0[.]0[.]1 dst 192[.]168[.]1[.]5"
    });
  });

  it("fangs defanged IPv4 addresses in text", async () => {
    const registry = new InMemoryRegistry();
    registry.register(fangIPs);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.fangIPs" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "src 10[.]0[.]0[.]1 dst 192[.]168[.]1[.]5" }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "src 10.0.0.1 dst 192.168.1.5"
    });
  });

  it("extracts unique valid ports", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractPorts);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.extractPorts" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "https://a:443 x port=8080 y port 70000 z :53" }
    });
    expect(out.output).toEqual({ type: "string", value: "53\n443\n8080" });
  });

  it("dechunks HTTP response payloads", async () => {
    const registry = new InMemoryRegistry();
    registry.register(dechunkHttpResponse);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.dechunkHttpResponse" }] };
    const chunked = "4\r\nWiki\r\n5\r\npedia\r\n0\r\n\r\n";
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: chunked }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("Wikipedia");
  });

  it("groups IPv4 addresses into CIDR buckets", async () => {
    const registry = new InMemoryRegistry();
    registry.register(groupIPAddresses);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "network.groupIPAddresses", args: { prefixLength: 24 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "src=10.0.0.1 dst=10.0.0.2 src=10.0.1.9 dst=10.0.1.20"
      }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "10.0.0.0/24\t2\n10.0.1.0/24\t2"
    });
  });
});
