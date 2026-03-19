import { test, expect } from "@playwright/test";

/**
 * P0 Smoke Tests — Dashboard Flow
 *
 * These verify that every dashboard route loads without crashing
 * and produces no console errors. They catch API response shape
 * mismatches, missing providers, and import errors that static
 * type checking may miss.
 */

test.describe("Dashboard Smoke Tests @smoke", () => {
  test("dashboard page loads without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    const response = await page.goto("/dashboard");

    // Page should return 200
    expect(response?.status()).toBe(200);

    // Page should have rendered the dashboard shell
    await expect(page.locator("main")).toBeVisible();

    // No console errors should have occurred
    expect(consoleErrors).toEqual([]);
  });

  test("dashboard renders KPI cards", async ({ page }) => {
    await page.goto("/dashboard");

    // At least one KPI card should be visible
    await expect(page.getByText("Revenue")).toBeVisible();
  });

  test("dashboard renders tab navigation", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sales" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Profitability" })).toBeVisible();
  });

  test("sales tab loads without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto("/dashboard");
    await page.getByRole("tab", { name: "Sales" }).click();

    // Wait for sales content to load
    await page.waitForTimeout(1000);

    expect(consoleErrors).toEqual([]);
  });

  test("profitability tab loads without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto("/dashboard");
    await page.getByRole("tab", { name: "Profitability" }).click();

    // Wait for profitability content to load
    await page.waitForTimeout(1000);

    expect(consoleErrors).toEqual([]);
  });

  test("API routes return valid JSON", async ({ request }) => {
    const routes = [
      "/api/dashboard/overview?period=month",
      "/api/dashboard/sales?period=month",
      "/api/dashboard/profitability?period=month",
      "/api/tasks",
    ];

    for (const route of routes) {
      const response = await request.get(route);
      expect(response.status(), `${route} should return 200`).toBe(200);

      const json = await response.json();
      expect(json, `${route} should have data field`).toHaveProperty("data");
      expect(json.error, `${route} should have null error`).toBeNull();
    }
  });
});
