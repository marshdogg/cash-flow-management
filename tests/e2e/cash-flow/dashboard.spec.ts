import { test, expect } from "@playwright/test";

test.describe("Cash Flow Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cash-flow/dashboard");
  });

  // Flow 1: Page Load & Layout
  test("1.1 Dashboard loads with correct title", async ({ page }) => {
    await expect(page.locator("main h1")).toContainText("Cash Flow Dashboard");
  });

  test("1.2 True Cash Position card displays formatted value", async ({
    page,
  }) => {
    await expect(page.locator("text=True Cash Position")).toBeVisible();
    await expect(page.locator("text=$48,500.00")).toBeVisible();
  });

  test("1.3 TCP card shows breakdown (bank + inflows - outflows)", async ({
    page,
  }) => {
    await expect(page.locator("text=Bank Balance")).toBeVisible();
    await expect(page.locator("text=Pending Inflows")).toBeVisible();
    await expect(page.locator("text=Pending Outflows")).toBeVisible();
  });

  test("1.4 Navigation sidebar shows Cash Flow Guide links", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Nav sidebar is hidden on mobile viewports");
    const nav = page.locator('nav[aria-label="Cash Flow Guide navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.locator("text=Dashboard")).toBeVisible();
    await expect(nav.locator("text=Weekly Ritual")).toBeVisible();
    await expect(nav.locator("text=Recurring Transactions")).toBeVisible();
  });

  // Flow 2: Health Gauge
  test("2.1 Health Gauge displays status with text label", async ({
    page,
  }) => {
    await expect(page.locator("text=Health Status")).toBeVisible();
    // Mock data returns "caution" status
    await expect(page.locator("text=Caution")).toBeVisible();
  });

  test("2.2 Health Gauge has proper ARIA role", async ({ page }) => {
    const gauge = page.locator('[role="meter"]');
    await expect(gauge).toBeVisible();
    await expect(gauge).toHaveAttribute(
      "aria-label",
      /Health Status/
    );
  });

  test("2.3 Weeks of runway displays formatted value", async ({ page }) => {
    await expect(page.locator("text=Weeks of Runway")).toBeVisible();
    await expect(page.locator("text=7.5 weeks").first()).toBeVisible();
  });

  // Flow 3: Projection Chart
  test("3.1 Projection chart renders SVG", async ({ page }) => {
    await expect(page.locator("text=13-Week Projection")).toBeVisible();
    const svg = page.locator(
      'svg[aria-label*="Cash flow projection"]'
    );
    await expect(svg).toBeVisible();
  });

  // Flow 4: Quick Actions
  test("4.1 Start Ritual button links to ritual page", async ({ page }) => {
    const ritualLink = page.locator('a:has-text("Start Ritual")');
    await expect(ritualLink).toBeVisible();
    await expect(ritualLink).toHaveAttribute("href", "/cash-flow/ritual");
  });

  test("4.2 Manage Transactions button links to recurring page", async ({
    page,
  }) => {
    const txnLink = page.locator('a:has-text("Manage Transactions")');
    await expect(txnLink).toBeVisible();
    await expect(txnLink).toHaveAttribute("href", "/cash-flow/recurring");
  });

  // Flow: Metrics Cards
  test("1.5 Net Weekly Cash Flow displays with sign prefix", async ({
    page,
  }) => {
    await expect(page.locator("text=Net Weekly Cash Flow")).toBeVisible();
    await expect(page.locator("text=+$1,500.00")).toBeVisible();
  });

  test("1.6 Last Ritual displays relative date", async ({ page }) => {
    await expect(page.locator("text=Last Ritual")).toBeVisible();
    // Mock data has daysSince: 3
    await expect(page.locator("text=3 days ago")).toBeVisible();
  });
});
