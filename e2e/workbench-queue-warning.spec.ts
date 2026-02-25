import { expect, test } from "@playwright/test";

test("shows queue saturation warning near queue limit", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("max-queue-input").fill("1");
  await page.getByTestId("catalog-search-input").fill("reverse");
  await page.locator("ul[aria-label]").first().getByRole("button").first().click();
  await page.getByRole("button", { name: /clear search|wyczyść wyszukiwanie/i }).click();
  await page.getByTestId("io-input").fill("abc");
  await page.getByTestId("run-button").click();

  await expect(
    page.getByText(/Queue saturation warning|Ostrzeżenie: nasycenie kolejki/i)
  ).toBeVisible();
});
