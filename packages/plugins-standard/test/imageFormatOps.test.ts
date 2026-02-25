import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { convertImageFormat } from "../src/ops/convertImageFormat.js";
import { coverImage } from "../src/ops/coverImage.js";
import { cropImage } from "../src/ops/cropImage.js";
import { ditherImage } from "../src/ops/ditherImage.js";
import { extractExif } from "../src/ops/extractExif.js";
import { flipImage } from "../src/ops/flipImage.js";
import { generateImage } from "../src/ops/generateImage.js";
import { generateQrCode } from "../src/ops/generateQrCode.js";
import { imageBrightnessContrast } from "../src/ops/imageBrightnessContrast.js";
import { imageFilter } from "../src/ops/imageFilter.js";
import { imageHueSaturationLightness } from "../src/ops/imageHueSaturationLightness.js";
import { imageOpacity } from "../src/ops/imageOpacity.js";
import { invertImage } from "../src/ops/invertImage.js";
import { normaliseImage } from "../src/ops/normaliseImage.js";
import { removeExif } from "../src/ops/removeExif.js";
import { renderImage } from "../src/ops/renderImage.js";
import { resizeImage } from "../src/ops/resizeImage.js";
import { rotateImage } from "../src/ops/rotateImage.js";
import { sharpenImage } from "../src/ops/sharpenImage.js";
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

describe("image format operations", () => {
  it("converts formats and resizes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(convertImageFormat);
    registry.register(resizeImage);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "image.convertFormat", args: { format: "jpeg" } },
        { opId: "image.resize", args: { width: 5, height: 5 } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });
    expect(out.output.type).toBe("bytes");
  });

  it("applies crop, cover, flip, and rotate", async () => {
    const registry = new InMemoryRegistry();
    registry.register(cropImage);
    registry.register(coverImage);
    registry.register(flipImage);
    registry.register(rotateImage);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "image.crop", args: { left: 0, top: 0, width: 5, height: 5 } },
        { opId: "image.cover", args: { width: 8, height: 8 } },
        { opId: "image.flip", args: { horizontal: true } },
        { opId: "image.rotate", args: { angle: 90 } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });
    expect(out.output.type).toBe("bytes");
  });

  it("applies filters and adjustments", async () => {
    const registry = new InMemoryRegistry();
    registry.register(ditherImage);
    registry.register(imageBrightnessContrast);
    registry.register(imageFilter);
    registry.register(imageHueSaturationLightness);
    registry.register(imageOpacity);
    registry.register(invertImage);
    registry.register(normaliseImage);
    registry.register(sharpenImage);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "image.dither" },
        { opId: "image.brightnessContrast", args: { brightness: 0.1, contrast: 0.1 } },
        { opId: "image.filter", args: { filter: "grayscale" } },
        { opId: "image.hsl", args: { hue: 10, saturation: 0.1, lightness: 0.1 } },
        { opId: "image.opacity", args: { opacity: 0.5 } },
        { opId: "image.invert" },
        { opId: "image.normalise" },
        { opId: "image.sharpen", args: { sigma: 1 } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: await makePngBytes() }
    });
    expect(out.output.type).toBe("bytes");
  });

  it("generates images and QR codes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(generateImage);
    registry.register(generateQrCode);
    registry.register(imageMetadata);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "image.generate", args: { width: 8, height: 8, color: "#00ff00" } },
        { opId: "image.metadata" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "ignored" }
    });
    expect(out.output.type).toBe("json");

    const qrRecipe: Recipe = { version: 1, steps: [{ opId: "image.generateQrCode" }] };
    const qrOut = await runRecipe({
      registry,
      recipe: qrRecipe,
      input: { type: "string", value: "hello" }
    });
    expect(qrOut.output.type).toBe("bytes");
  });

  it("renders SVG and handles EXIF removal", async () => {
    const registry = new InMemoryRegistry();
    registry.register(renderImage);
    registry.register(extractExif);
    registry.register(removeExif);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "image.render" },
        { opId: "image.removeExif" },
        { opId: "image.extractExif" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: svg }
    });
    expect(out.output.type).toBe("json");
  });
});
