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
import { dnsOverHttps } from "../src/ops/dnsOverHttps.js";
import { parseIPv6Address } from "../src/ops/parseIPv6Address.js";
import { ipv6TransitionAddresses } from "../src/ops/ipv6TransitionAddresses.js";
import { parseIPRange } from "../src/ops/parseIPRange.js";
import { stripHttpHeaders } from "../src/ops/stripHttpHeaders.js";
import { parseIPv4Header } from "../src/ops/parseIPv4Header.js";
import { parseTcpHeaderOp } from "../src/ops/parseTcpHeader.js";
import { parseTlsRecord } from "../src/ops/parseTlsRecord.js";
import { parseUdpHeaderOp } from "../src/ops/parseUdpHeader.js";
import { parseUri } from "../src/ops/parseUri.js";
import { parseX509Certificate } from "../src/ops/parseX509Certificate.js";
import { parseX509Crl } from "../src/ops/parseX509Crl.js";
import { stripIPv4Header } from "../src/ops/stripIPv4Header.js";
import { stripTcpHeader } from "../src/ops/stripTcpHeader.js";
import { stripUdpHeader } from "../src/ops/stripUdpHeader.js";

const TEST_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDbzCCAlegAwIBAgIUCABVjT3MsNUh+DVgwheQqZ0Q6dMwDQYJKoZIhvcNAQEL
BQAwRzEeMBwGA1UEAwwVY3liZXJtYXN0ZXJjaGVmLmxvY2FsMRgwFgYDVQQKDA9D
eWJlck1hc3RlckNoZWYxCzAJBgNVBAYTAlBMMB4XDTI2MDMxMTE3MzYwN1oXDTI3
MDMxMTE3MzYwN1owRzEeMBwGA1UEAwwVY3liZXJtYXN0ZXJjaGVmLmxvY2FsMRgw
FgYDVQQKDA9DeWJlck1hc3RlckNoZWYxCzAJBgNVBAYTAlBMMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvkr3jvQXX+1anzhnV+3g9WxC+EvhCLozbhxT
SjYoSNh9tDEZLuuB4MtGEoararWu7nSqToRFm5Aq31tE1HIi2YHV+HguZDYcLo68
NMXVsRz+Sndtc4Hy96JzFDK5P5oFxxf5OptiMVSPqHF3wPYbojDyb+VdJ+cv+56k
NStVHNc7s1fqQWdSBaI7RxeaOnd6Fa8ulkDbnqBNSXNPXYhCYK+5sIo5/uhq+LJY
RpkSu8F30Y3FVEqT48RBIyHJBGS1VGc6BqQDAetD1kIyLobxjte+r0CH+4zxU0If
yyWUPk5ZD5MUBG8HIwevyUOXtUMbUWEvpGbCb1k33SQv4DWMJQIDAQABo1MwUTAd
BgNVHQ4EFgQUJasvV7cLiEsMmY+lY0z/BY77w7IwHwYDVR0jBBgwFoAUJasvV7cL
iEsMmY+lY0z/BY77w7IwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOC
AQEAneZ+uwSUnQWXatfsILbsTOuO0b7wYtBW6W5XCMF/hstP4OWXAMDjnNxBzOtV
Iic4kC+FrUI2D98LptdEuZgr0YQbg040KT8humgXaUl9ln4AXx/ftOA7vwHHQCOp
HCG4qybefaX9pveQiXqFMVW9RjiuZ05nt51pbvoLPXc0xITRj9ln2u4emC72+gKJ
8xpRJ+Bcn47/vdPU3UsZRe6xN3xu4sb25ormLgC6ST3KVC5midhT4k9s0HgoRd8/
Dwhr8089H6EseuS53qNSz6YhSsqvmqXqRhZb5aZfBtTyxRnAaFyTSpY6L9leDsg1
ChAElaYK6IS3khN6lXxpR1ETjQ==
-----END CERTIFICATE-----`;

const TEST_CRL_PEM = `-----BEGIN X509 CRL-----
MIIBnjCBhwIBATANBgkqhkiG9w0BAQsFADBEMRswGQYDVQQDDBJDeWJlck1hc3Rl
ckNoZWYgQ0ExGDAWBgNVBAoMD0N5YmVyTWFzdGVyQ2hlZjELMAkGA1UEBhMCUEwX
DTI2MDMxMTE3MzYwN1oXDTI2MDQxMDE3MzYwN1qgDzANMAsGA1UdFAQEAgIQADAN
BgkqhkiG9w0BAQsFAAOCAQEAdzX+KXLrrXZSo/AZ8d72ifNAYsvqTLjX020vtNzt
+vwkKf238xZUzWc3cjA3y0bmezudenVxgP3xDikx9rp3iIR1BjNsZ5aOnItdSbjJ
nHs7xyeWOoBiv/fLXGyT5sLrI1GNFXaf8JiiYnwP5ZqHGkKnb3ul6LfKRk+7kE3P
JnlE6+b4fpWF1ta9oS4uwb16G08KeFFnr6uop12P7VfABW6yFSjzE7RfTFjTflPy
eYCY7W5FnmP4WbhFJSypYYE9IqBHPud7Rz35utY5/e68aNmBYB6FAfMne95vAOuS
JlqbNkL/3MFnoDcndGWdfdmo9NH/62Frdy864yED9LGZ7g==
-----END X509 CRL-----`;

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

  it("detects IPv6 transition address families", async () => {
    const registry = new InMemoryRegistry();
    registry.register(ipv6TransitionAddresses);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.ipv6TransitionAddresses" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "2002:c000:0204::1 2001:0000:4136:e378:8000:63bf:3fff:fdd2 ::ffff:192.0.2.128"
      }
    });
    expect(out.output).toEqual({
      type: "json",
      value: [
        {
          address: "2002:c000:0204::1",
          scheme: "6to4",
          embeddedIpv4: "192.0.2.4"
        },
        {
          address: "2001:0000:4136:e378:8000:63bf:3fff:fdd2",
          scheme: "teredo",
          serverIpv4: "65.54.227.120",
          clientIpv4: "192.0.2.45"
        },
        {
          address: "::ffff:192.0.2.128",
          scheme: "ipv4-mapped",
          embeddedIpv4: "192.0.2.128"
        }
      ]
    });
  });

  it("queries DNS-over-HTTPS for domains", async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify({ Answer: [{ data: "93.184.216.34" }] }), { status: 200 })
      );
    try {
      const registry = new InMemoryRegistry();
      registry.register(dnsOverHttps);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "network.dnsOverHttps",
            args: {
              recordType: "A",
              resolverUrl: "https://dns.google/resolve",
              allowHosts: "dns.google"
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "example.com" }
      });
      expect(out.output).toEqual({ type: "string", value: "example.com\t93.184.216.34" });
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it("parses TLS record headers from hex input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseTlsRecord);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseTlsRecord" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "16 03 03 00 04 01 00 00 00 17 03 03 00 00" }
    });
    expect(out.output).toEqual({
      type: "json",
      value: {
        records: [
          {
            offset: 0,
            contentType: "handshake",
            version: "TLS 1.2",
            length: 4,
            handshakeType: "client_hello"
          },
          {
            offset: 9,
            contentType: "application_data",
            version: "TLS 1.2",
            length: 0,
            handshakeType: null
          }
        ],
        trailingBytes: 0
      }
    });
  });

  it("parses PEM X.509 certificates and CRLs", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseX509Certificate);
    registry.register(parseX509Crl);

    const certificate = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "network.parseX509Certificate" }] },
      input: { type: "string", value: TEST_CERT_PEM }
    });
    expect(certificate.output).toEqual({
      type: "json",
      value: {
        subject: "CN=cybermasterchef.local, O=CyberMasterChef, C=PL",
        issuer: "CN=cybermasterchef.local, O=CyberMasterChef, C=PL",
        serialNumber: "0800558d3dccb0d521f83560c21790a99d10e9d3",
        validFrom: "2026-03-11T17:36:07Z",
        validTo: "2027-03-11T17:36:07Z",
        selfIssued: true
      }
    });

    const crl = await runRecipe({
      registry,
      recipe: { version: 1, steps: [{ opId: "network.parseX509Crl" }] },
      input: { type: "string", value: TEST_CRL_PEM }
    });
    expect(crl.output).toEqual({
      type: "json",
      value: {
        issuer: "CN=CyberMasterChef CA, O=CyberMasterChef, C=PL",
        thisUpdate: "2026-03-11T17:36:07Z",
        nextUpdate: "2026-04-10T17:36:07Z",
        revokedCertificates: 0
      }
    });
  });

  it("rejects non-allowlisted DNS resolver", async () => {
    const registry = new InMemoryRegistry();
    registry.register(dnsOverHttps);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "network.dnsOverHttps",
          args: {
            resolverUrl: "https://dns.google/resolve",
            allowHosts: "resolver.example"
          }
        }
      ]
    };
    await expect(
      runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "example.com" }
      })
    ).rejects.toThrow("resolverUrl host not allowlisted");
  });

  it("parses and normalizes IPv6 addresses", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseIPv6Address);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseIPv6Address" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "2001:0db8:0000:0000:0000:ff00:0042:8329"
      }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      version: 6,
      compressed: "2001:db8::ff00:42:8329",
      expanded: "2001:0db8:0000:0000:0000:ff00:0042:8329",
      kind: "documentation"
    });
  });

  it("parses IPv4 CIDR ranges with network metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseIPRange);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseIPRange" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "192.168.1.10/24" }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      kind: "cidr",
      version: 4,
      network: "192.168.1.0",
      broadcast: "192.168.1.255",
      firstHost: "192.168.1.1",
      lastHost: "192.168.1.254",
      count: "256"
    });
  });

  it("parses explicit IPv6 ranges", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseIPRange);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseIPRange" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "2001:db8::1-2001:db8::3" }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      kind: "range",
      version: 6,
      start: "2001:db8::1",
      end: "2001:db8::3",
      count: "3"
    });
  });

  it("strips HTTP headers and returns the body bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(stripHttpHeaders);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.stripHttpHeaders" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nhello"
      }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("hello");
  });

  it("parses IPv4 headers into normalized metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseIPv4Header);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseIPv4Header" }] };
    const packet = new Uint8Array([
      0x45, 0x00, 0x00, 0x17, 0x12, 0x34, 0x40, 0x00, 0x40, 0x11, 0x00, 0x00,
      0xc0, 0xa8, 0x01, 0x0a, 0x08, 0x08, 0x08, 0x08, 0x61, 0x62, 0x63
    ]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: packet }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      version: 4,
      headerLengthBytes: 20,
      totalLength: 23,
      ttl: 64,
      protocolNumber: 17,
      protocolName: "UDP",
      source: "192.168.1.10",
      destination: "8.8.8.8"
    });
  });

  it("strips IPv4 headers and returns payload bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(stripIPv4Header);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.stripIPv4Header" }] };
    const packet = new Uint8Array([
      0x45, 0x00, 0x00, 0x17, 0x12, 0x34, 0x40, 0x00, 0x40, 0x11, 0x00, 0x00,
      0xc0, 0xa8, 0x01, 0x0a, 0x08, 0x08, 0x08, 0x08, 0x61, 0x62, 0x63
    ]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: packet }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("abc");
  });

  it("parses TCP headers into normalized metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseTcpHeaderOp);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseTcpHeader" }] };
    const segment = new Uint8Array([
      0x00, 0x50, 0x13, 0x88, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
      0x50, 0x18, 0x20, 0x00, 0x12, 0x34, 0x00, 0x00, 0x68, 0x69
    ]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: segment }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({
      sourcePort: 80,
      destinationPort: 5000,
      sequenceNumber: 1,
      acknowledgementNumber: 2,
      headerLengthBytes: 20,
      windowSize: 8192,
      checksum: "1234"
    });
    expect(out.output.value).toMatchObject({
      flags: { ack: true, psh: true, syn: false }
    });
  });

  it("parses UDP headers into normalized metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseUdpHeaderOp);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseUdpHeader" }] };
    const datagram = new Uint8Array([
      0x13, 0x89, 0x00, 0x35, 0x00, 0x0a, 0xab, 0xcd, 0x6f, 0x6b
    ]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: datagram }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toEqual({
      sourcePort: 5001,
      destinationPort: 53,
      length: 10,
      checksum: "abcd",
      payloadLength: 2
    });
  });

  it("strips TCP headers and returns payload bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(stripTcpHeader);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.stripTcpHeader" }] };
    const segment = new Uint8Array([
      0x00, 0x50, 0x13, 0x88, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x50, 0x18, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x68, 0x69
    ]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: segment }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("hi");
  });

  it("strips UDP headers and returns payload bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(stripUdpHeader);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.stripUdpHeader" }] };
    const datagram = new Uint8Array([
      0x13, 0x89, 0x00, 0x35, 0x00, 0x0a, 0x00, 0x00, 0x6f, 0x6b
    ]);
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: datagram }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("ok");
  });

  it("parses absolute URIs into normalized components", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseUri);
    const recipe: Recipe = { version: 1, steps: [{ opId: "network.parseUri" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "https://alice:secret@example.com:8443/a/b?x=1&x=2#frag"
      }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toEqual({
      href: "https://alice:secret@example.com:8443/a/b?x=1&x=2#frag",
      scheme: "https",
      username: "alice",
      password: "secret",
      origin: "https://example.com:8443",
      host: "example.com:8443",
      hostname: "example.com",
      port: "8443",
      path: "/a/b",
      query: "x=1&x=2",
      fragment: "frag",
      queryParams: [
        { key: "x", value: "1" },
        { key: "x", value: "2" }
      ]
    });
  });
});
