import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §11
  // prd-expectation: Arrow keys navigate between tabs within the tablist
  // priority: P0
  test("A1 — Tab navigation with arrow keys", async ({ page }) => {
    const overviewTab = page.getByRole("tab", { name: "Overview" });
    await overviewTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Sales" })).toBeFocused();
  });

  // prd-section: §11
  // prd-expectation: Enter and Space keys activate the currently focused tab
  // priority: P0
  test("A2 — Enter/Space activates focused tab", async ({ page }) => {
    const salesTab = page.getByRole("tab", { name: "Sales" });
    await salesTab.focus();
    await page.keyboard.press("Enter");
    await expect(salesTab).toHaveAttribute("aria-selected", "true");
  });

  // prd-section: §11
  // prd-expectation: Tablist has proper ARIA roles with aria-selected on active tab and 3 total tabs
  // priority: P1
  test("A5 — ARIA roles on tabs", async ({ page }) => {
    await expect(page.getByRole("tablist")).toBeVisible();
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(3); // Overview, Sales, Profitability
    // Active tab should have aria-selected=true
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    // Inactive tabs should have aria-selected=false
    await expect(page.getByRole("tab", { name: "Sales" })).toHaveAttribute("aria-selected", "false");
  });

  // prd-section: §11
  // prd-expectation: Skip to main content link becomes visible and focused on first Tab key press
  // priority: P2
  test("A8 — Skip to main content link", async ({ page, isMobile }) => {
    test.skip(isMobile, "Tab key focus order differs in mobile emulation");
    // The skip link is sr-only by default, becomes visible on focus
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a:has-text("Skip to main content")');
    await expect(skipLink).toBeFocused();
  });

  // prd-section: §11
  // prd-expectation: Page has proper heading hierarchy with h1 Dashboard and h2 section headings
  // priority: P2
  test("A9 — Heading hierarchy", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("Dashboard");
    // Should have h2 section headings
    const h2s = page.getByRole("heading", { level: 2 });
    await expect(h2s.first()).toBeVisible();
  });

  // prd-section: §11
  // prd-expectation: Task checkboxes are keyboard accessible and toggled with Space key
  // priority: P1
  test("A10 — Task checkbox keyboard accessible", async ({ page }) => {
    const checkbox = page.getByRole("checkbox").first();
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
  });
});
