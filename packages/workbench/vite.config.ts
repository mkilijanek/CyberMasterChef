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
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("jsonata")) return "vendor-jsonata";
          if (id.includes("avsc")) return "vendor-avro";
          if (id.includes("cbor")) return "vendor-cbor";
          if (id.includes("sharp")) return "vendor-sharp";
          if (id.includes("protobufjs")) return "vendor-protobuf";
          return "vendor";
        }
      }
    }
  },
  worker: {
    format: "es"
  }
});
