import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@cybermasterchef/core": new URL("../core/src/index.ts", import.meta.url)
        .pathname,
      "@cybermasterchef/plugins-standard": new URL(
        "../plugins-standard/src/index.ts",
        import.meta.url
      ).pathname
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 95,
        lines: 80
      }
    }
  }
});
