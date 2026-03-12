import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "..", "..", "..");
const requiredDirectives = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self'",
  "img-src 'self' data:",
  "worker-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'"
];
const requiredSecurityHeaders = [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Cross-Origin-Resource-Policy"
];

function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

describe("runtime security policy", () => {
  it("keeps the CSP checklist aligned with the enforced directives", () => {
    const checklist = readRepoFile("docs/security/csp-checklist.md");
    for (const directive of requiredDirectives) {
      expect(checklist).toContain(directive);
    }
  });

  it("keeps the public security docs aligned with the enforced CSP", () => {
    const securityDoc = readRepoFile("SECURITY.md");
    const architectureDoc = readRepoFile("docs/architecture.md");
    for (const directive of requiredDirectives) {
      expect(securityDoc).toContain(directive);
      expect(architectureDoc).toContain(directive);
    }
  });

  it("keeps nginx runtime headers aligned with the smoke-test expectations", () => {
    const nginxConfig = readRepoFile("docker/nginx/default.conf");
    const securityHeadersConfig = readRepoFile("docker/nginx/security-headers.conf");
    for (const headerName of requiredSecurityHeaders) {
      expect(securityHeadersConfig.toLowerCase()).toContain(`add_header ${headerName}`.toLowerCase());
    }
    for (const directive of requiredDirectives) {
      expect(securityHeadersConfig).toContain(directive);
    }
    expect(nginxConfig).toContain("include /etc/nginx/snippets/security-headers.conf;");
    expect(nginxConfig).toContain("limit_except GET HEAD");
    expect(nginxConfig).toContain("Cache-Control");
  });

  it("keeps the asset extraction pattern aligned with built workbench references", () => {
    const assetPaths = [
      ...new Set(
        [
          ...`
      <script src="/assets/index-a.js"></script>
      <link rel="modulepreload" href="/assets/vendor-a.js">
      <link rel="modulepreload" href="/assets/vendor-a.js">
      <link rel="stylesheet" href="/assets/index-a.css">
    `.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)
        ].map((match) => match[1])
      )
    ];
    expect(assetPaths).toEqual([
      "/assets/index-a.js",
      "/assets/vendor-a.js",
      "/assets/index-a.css"
    ]);
  });

  it("keeps the smoke-test header sample aligned with the enforced runtime policy", () => {
    const headerBlock = [
      "HTTP/1.1 200 OK",
      "Content-Security-Policy: default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options: nosniff",
      "X-Frame-Options: DENY",
      "Referrer-Policy: no-referrer",
      "Permissions-Policy: accelerometer=(), camera=(), microphone=(), payment=()",
      "Cross-Origin-Resource-Policy: same-origin"
    ].join("\n");
    const parsed = Object.fromEntries(
      headerBlock
        .split("\n")
        .filter((line) => line.includes(":"))
        .map((line) => {
          const separatorIndex = line.indexOf(":");
          return [
            line.slice(0, separatorIndex).trim().toLowerCase(),
            line.slice(separatorIndex + 1).trim()
          ];
        })
    );
    expect(parsed).toMatchObject({
      "content-security-policy":
        "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "no-referrer",
      "cross-origin-resource-policy": "same-origin"
    });
    for (const directive of requiredDirectives) {
      expect(parsed["content-security-policy"]).toContain(directive);
    }
    expect(parsed["permissions-policy"]).toContain("camera=()");
    expect(parsed["permissions-policy"]).toContain("microphone=()");
    expect(parsed["permissions-policy"]).toContain("payment=()");
  });
});
