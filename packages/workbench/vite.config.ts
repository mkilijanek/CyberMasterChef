import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
  worker: {
    format: "es"
  }
});
