import { expect, test } from "@playwright/test";

test("invalid import payload shows import error", async ({ page }) => {
  await page.addInitScript(() => {
    window.prompt = (() => "{bad-json") as typeof window.prompt;
  });
  await page.goto("/");
  await page.getByTestId("import-recipe-button").click();
  await expect(page.getByRole("alert")).toContainText("Import");
});

test("import with no compatible operations shows failure", async ({ page }) => {
  await page.addInitScript(() => {
    const payload = JSON.stringify({
      recipe: [{ op: "Totally Unsupported", args: [] }]
    });
    window.prompt = (() => payload) as typeof window.prompt;
  });
  await page.goto("/");
  await page.getByTestId("import-recipe-button").click();
  await expect(page.getByRole("alert")).toContainText("Import");
});

test("operation search empty state is visible for unmatched query", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Szukaj…").fill("definitely-no-op-xyz");
  await expect(page.getByText("Brak operacji pasujących do zapytania")).toBeVisible();
});

