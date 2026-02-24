import { expect, test } from "@playwright/test";

test("persists worker pool settings after reload", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("pool-size-input").fill("3");
  await page.getByTestId("max-queue-input").fill("9");

  await page.reload();

  await expect(page.getByTestId("pool-size-input")).toHaveValue("3");
  await expect(page.getByTestId("max-queue-input")).toHaveValue("9");
});
