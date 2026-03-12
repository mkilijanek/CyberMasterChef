import { expect, test } from "@playwright/test";

test("import recipe + run + run-to-step", async ({ page }) => {
  await page.addInitScript(() => {
    const recipe = {
      version: 1,
      steps: [{ opId: "text.reverse", args: {} }]
    };
    const serialized = JSON.stringify(recipe);
    window.prompt = (() => serialized) as typeof window.prompt;
  });
  await page.goto("/");
  await page.getByTestId("import-recipe-button").click();
  await expect(page.getByTestId("recipe-run-to-step-0")).toBeVisible();
  await page.getByTestId("io-input").fill("Cyber");
  await page.getByTestId("run-button").click();
  await expect(page.getByTestId("io-output")).toHaveValue("rebyC");
  await page.getByTestId("recipe-run-to-step-0").click();
  await expect(page.getByTestId("io-output")).toHaveValue("rebyC");
});

test("share link copies hash state", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { __copiedLink?: string }).__copiedLink = value;
        }
      }
    });
  });
  await page.goto("/");
  await page.getByTestId("io-input").fill("abc");
  await page.getByTestId("share-link-button").click();
  const copied = await page.evaluate(
    () => (window as typeof window & { __copiedLink?: string }).__copiedLink ?? ""
  );
  expect(copied).toContain("#state=");
});

test("timeout value persists across reload", async ({ page }) => {
  await page.goto("/");
  const timeout = page.getByTestId("timeout-input");
  await timeout.fill("250");
  await timeout.blur();
  await page.reload();
  await expect(page.getByTestId("timeout-input")).toHaveValue("250");
});

test("adds SHA-256 step from catalog and runs it", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("catalog-search-input").fill("sha-256");
  await page.locator(".list .buttonSmall").first().click();
  await expect(page.getByTestId("recipe-run-to-step-0")).toBeVisible();
  await page.getByTestId("io-input").fill("abc");
  await page.getByTestId("run-button").click();
  await expect(page.getByTestId("io-output")).toHaveValue(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
});
