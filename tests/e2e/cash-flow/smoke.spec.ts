import { test, expect } from "@playwright/test";

test.describe("Cash Flow Guide — Smoke Tests @smoke", () => {
  test("17.1 Dashboard route loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/cash-flow/dashboard");
    await expect(page.locator("main h1")).toContainText("Cash Flow Dashboard");
    expect(errors).toHaveLength(0);
  });

  test("17.2 Ritual route loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/cash-flow/ritual");
    await expect(page.locator("text=Weekly Cash Flow Check-In")).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test("17.3 Recurring route loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/cash-flow/recurring");
    await expect(page.locator("main h1")).toContainText("Recurring Transactions");
    expect(errors).toHaveLength(0);
  });

  test("17.4 Dashboard API returns valid JSON", async ({ request }) => {
    const response = await request.get(
      "/api/cash-flow/dashboard?franchise=fr_toronto_east"
    );
    expect(response.ok()).toBe(true);

    const json = await response.json();
    expect(json).toHaveProperty("data");
    expect(json).toHaveProperty("error", null);
    expect(json.data).toHaveProperty("tcp");
    expect(json.data).toHaveProperty("health");
    expect(json.data).toHaveProperty("projection");
  });

  test("17.5 Recurring API returns valid JSON", async ({ request }) => {
    const response = await request.get(
      "/api/cash-flow/recurring?franchise=fr_toronto_east"
    );
    expect(response.ok()).toBe(true);

    const json = await response.json();
    expect(json).toHaveProperty("data");
    expect(json).toHaveProperty("error", null);
    expect(json.data).toHaveProperty("transactions");
    expect(json.data).toHaveProperty("meta");
    expect(Array.isArray(json.data.transactions)).toBe(true);
  });
});
