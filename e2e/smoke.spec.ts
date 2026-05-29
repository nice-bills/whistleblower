import { test, expect } from "@playwright/test";

test("registry home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("link", { name: /registry/i }).first()).toBeVisible();
  await expect(page.getByText(/all pairs/i)).toBeVisible({ timeout: 30_000 });
});

test("getting started route loads", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("heading", { name: /getting started/i })).toBeVisible();
});

test("portfolio route loads", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page.getByRole("heading", { name: /portfolio/i })).toBeVisible();
});
