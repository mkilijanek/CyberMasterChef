import { expect, test } from "@playwright/test";

test("run metadata is shown after execution", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("catalog-search-input").fill("reverse");
  await page.locator("ul[aria-label]").first().getByRole("button").first().click();
  await page.getByRole("button", { name: /clear search|wyczyść wyszukiwanie/i }).click();

  await page.getByTestId("io-input").fill("abc123");
  await page.getByTestId("run-button").click();

  await expect(page.getByText(/Run ID:|ID uruchomienia:/)).toContainText(/[0-9a-f-]{8,}/i);
  await expect(page.getByText(/Recipe hash:|Hash receptury:/)).toContainText(/[0-9a-f]{12}/i);
  await expect(page.getByText(/Input hash:|Hash wejścia:/)).toContainText(/[0-9a-f]{12}/i);
  await expect(page.locator(".traceItem").first()).toContainText(/ms\)/);
});
