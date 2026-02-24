import { expect, test } from "@playwright/test";

test("persists recipe/input/autobake/searches after reload", async ({ page }) => {
  await page.addInitScript(() => {
    const recipe = {
      version: 1,
      steps: [{ opId: "text.reverse", args: {} }]
    };
    window.prompt = (() => JSON.stringify(recipe)) as typeof window.prompt;
  });

  await page.goto("/");
  await page.getByTestId("import-recipe-button").click();
  await expect(page.getByTestId("recipe-run-to-step-0")).toBeVisible();

  await page.getByTestId("io-input").fill("persist-me");
  await page.getByTestId("autobake-toggle").check();
  await page.getByTestId("catalog-search-input").fill("reverse");
  await page.getByTestId("trace-search-input").fill("text.reverse");

  await page.reload();

  await expect(page.getByTestId("recipe-run-to-step-0")).toBeVisible();
  await expect(page.getByTestId("io-input")).toHaveValue("persist-me");
  await expect(page.getByTestId("autobake-toggle")).toBeChecked();
  await expect(page.getByTestId("catalog-search-input")).toHaveValue("reverse");
  await expect(page.getByTestId("trace-search-input")).toHaveValue("text.reverse");
});

