import assert from "node:assert/strict";
import test from "node:test";
import {
  assertSecurityHeaders,
  extractAssetPaths,
  parseHeaderBlock
} from "./smoke-test-lib.mjs";

test("extractAssetPaths returns unique built asset references", () => {
  assert.deepEqual(
    extractAssetPaths(`
      <script src="/assets/index-a.js"></script>
      <link href="/assets/vendor-a.js" rel="modulepreload">
      <link href="/assets/vendor-a.js" rel="modulepreload">
      <link href="/assets/index-a.css" rel="stylesheet">
    `),
    ["/assets/index-a.js", "/assets/vendor-a.js", "/assets/index-a.css"]
  );
});

test("parseHeaderBlock normalizes header names and ignores non-header lines", () => {
  assert.deepEqual(
    parseHeaderBlock([
      "HTTP/1.1 200 OK",
      "Content-Security-Policy: default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "X-Frame-Options: DENY",
      ": ignored",
      "Broken Line"
    ].join("\n")),
    {
      "content-security-policy":
        "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "x-frame-options": "DENY"
    }
  );
});

test("assertSecurityHeaders accepts valid header blocks and maps", () => {
  const headerBlock = [
    "Content-Security-Policy: default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: no-referrer",
    "Permissions-Policy: accelerometer=(), camera=(), microphone=(), payment=()",
    "Cross-Origin-Resource-Policy: same-origin"
  ].join("\n");
  assert.doesNotThrow(() => assertSecurityHeaders(headerBlock));
  assert.doesNotThrow(() =>
    assertSecurityHeaders({
      "content-security-policy":
        "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "no-referrer",
      "permissions-policy": "accelerometer=(), camera=(), microphone=(), payment=()",
      "cross-origin-resource-policy": "same-origin"
    })
  );
});

test("assertSecurityHeaders rejects missing headers and missing fragments", () => {
  assert.throws(
    () =>
      assertSecurityHeaders({
        "content-security-policy":
          "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        "x-content-type-options": "nosniff"
      }),
    /Missing security header: x-frame-options/
  );
  assert.throws(
      () =>
      assertSecurityHeaders({
        "content-security-policy": "default-src 'none'",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "no-referrer",
        "permissions-policy": "accelerometer=(), camera=(), microphone=(), payment=()",
        "cross-origin-resource-policy": "same-origin"
      }),
    /Security header content-security-policy missing fragment: script-src 'self' 'wasm-unsafe-eval'/
  );
});
