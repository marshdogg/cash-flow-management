import { test, expect } from "@playwright/test";

test.describe("Cash Flow Ritual Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cash-flow/ritual");
  });

  // Flow 5: Step Navigation
  test("5.1 Wizard starts at Welcome step", async ({ page }) => {
    await expect(page.locator("text=Weekly Cash Flow Check-In")).toBeVisible();
    await expect(page.locator("text=Let's Get Started")).toBeVisible();
  });

  test("5.2 Step indicator shows Step 1 as current", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      // Mobile uses text-based step indicator (desktop stepper is hidden)
      await expect(page.locator("text=Step 1 of 5")).toBeVisible();
    } else {
      const stepIndicator = page.locator('[aria-current="step"]');
      await expect(stepIndicator).toBeVisible();
    }
  });

  test("5.3 Clicking Let's Get Started advances to Step 2", async ({
    page,
  }) => {
    await page.click("text=Let's Get Started");
    await expect(page.locator("text=Update Bank Balance")).toBeVisible();
  });

  // Flow 6: Bank Balance Input
  test("6.1 Bank Balance step shows input field", async ({ page }) => {
    await page.click("text=Let's Get Started");
    const input = page.locator("#bank-balance");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "number");
  });

  test("6.2 Entering valid balance and continuing advances to Step 3", async ({
    page,
  }) => {
    await page.click("text=Let's Get Started");
    await page.fill("#bank-balance", "50000");
    await page.click("text=Continue");
    await expect(
      page.locator("text=Review Recurring Transactions")
    ).toBeVisible();
  });

  test("6.3 Empty balance shows validation error", async ({ page }) => {
    await page.click("text=Let's Get Started");
    await page.click("text=Continue");
    await expect(page.locator("text=Enter a valid dollar amount")).toBeVisible();
  });

  test("6.4 Back button returns to Welcome step", async ({ page }) => {
    await page.click("text=Let's Get Started");
    await page.click("text=Back");
    await expect(page.locator("text=Weekly Cash Flow Check-In")).toBeVisible();
  });

  // Flow 7: Review Recurring
  test("7.1 Review step shows transaction list", async ({ page }) => {
    await page.click("text=Let's Get Started");
    await page.fill("#bank-balance", "50000");
    await page.click("text=Continue");
    await expect(
      page.locator("text=Review Recurring Transactions")
    ).toBeVisible();
    // Should show transactions from mock data
    await expect(
      page.locator("text=Residential Painting Revenue")
    ).toBeVisible();
  });

  // Flow 8: One-Off Items
  test("8.1 One-off step allows adding items", async ({ page }) => {
    // Navigate to step 4
    await page.click("text=Let's Get Started");
    await page.fill("#bank-balance", "50000");
    await page.click("text=Continue");
    await page.click("text=Continue");
    // Step labels appear in both the step indicator and page content — use heading role
    await expect(page.getByRole("heading", { name: /One-Off Items/ })).toBeVisible();
    await expect(page.locator("text=Add One-Off Item")).toBeVisible();
  });

  // Flow 9: Summary
  test("9.1 Summary step shows calculated metrics", async ({ page }) => {
    // Navigate to step 5
    await page.click("text=Let's Get Started");
    await page.fill("#bank-balance", "50000");
    await page.click("text=Continue");
    await page.click("text=Continue");
    await page.click("text=Continue");
    // Step labels appear in both the step indicator and page content — use heading role
    await expect(page.getByRole("heading", { name: /Summary/ })).toBeVisible();
    // "Bank Balance" also appears in step indicator — use last visible (step content)
    await expect(page.locator("text=Bank Balance").last()).toBeVisible();
    await expect(page.locator("text=True Cash Position")).toBeVisible();
    await expect(page.locator("text=Complete Ritual")).toBeVisible();
  });

  // Flow 10: Abandon & Resume
  test("10.1 Save & exit link is visible after Step 1", async ({ page }) => {
    await page.click("text=Let's Get Started");
    await expect(page.locator("text=Save & exit")).toBeVisible();
  });
});
