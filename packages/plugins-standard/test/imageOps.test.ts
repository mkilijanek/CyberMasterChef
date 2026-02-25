import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { addTextToImage } from "../src/ops/addTextToImage.js";
import { blurImage } from "../src/ops/blurImage.js";
import { containImage } from "../src/ops/containImage.js";
import { imageMetadata } from "../src/ops/imageMetadata.js";

async function makePngBytes(): Promise<Uint8Array> {
  const { default: sharp } = await import("sharp");
  const buffer = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  })
    .png()
    .toBuffer();
  return new Uint8Array(buffer);
}

describe("image operations", () => {
  it("extracts image metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(imageMetadata);
    const recipe: Recipe = { version: 1, steps: [{ opId: "image.metadata" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    const meta = out.output.value as { width: number; height: number; format: string };
    expect(meta.width).toBe(10);
    expect(meta.height).toBe(10);
    expect(meta.format).toBe("png");
  });

  it("blurs images", async () => {
    const registry = new InMemoryRegistry();
    registry.register(blurImage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "image.blur" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });

    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value.length).toBeGreaterThan(0);
  });

  it("resizes images with contain", async () => {
    const registry = new InMemoryRegistry();
    registry.register(containImage);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "image.contain", args: { width: 20, height: 20 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });

    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value.length).toBeGreaterThan(0);
  });

  it("overlays text on images", async () => {
    const registry = new InMemoryRegistry();
    registry.register(addTextToImage);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "image.addText", args: { text: "Hi" } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });

    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(out.output.value.length).toBeGreaterThan(0);
  });
});
