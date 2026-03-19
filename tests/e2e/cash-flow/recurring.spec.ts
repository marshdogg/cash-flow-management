import { test, expect } from "@playwright/test";

test.describe("Cash Flow Recurring Transactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cash-flow/recurring");
  });

  // Flow 11: Table Rendering
  test("11.1 Page shows title and Add Transaction button", async ({
    page,
    isMobile,
  }) => {
    await expect(page.locator("main h1")).toContainText("Recurring Transactions");
    // Add Transaction button is only visible for Franchise Partner role
    if (!isMobile) {
      await expect(page.locator("text=Add Transaction")).toBeVisible();
    }
  });

  test("11.2 Transaction table displays mock data", async ({ page }) => {
    await expect(
      page.locator("text=Residential Painting Revenue")
    ).toBeVisible();
    await expect(page.locator("text=Crew Payroll")).toBeVisible();
    await expect(page.locator("text=Office Rent")).toBeVisible();
  });

  test("11.3 Table shows Income/Expense badges", async ({ page }) => {
    await expect(page.locator("text=Income").first()).toBeVisible();
    await expect(page.locator("text=Expense").first()).toBeVisible();
  });

  test("11.4 Table shows Active/Paused status", async ({ page }) => {
    await expect(page.locator("text=Active").first()).toBeVisible();
    await expect(page.locator("text=Paused").first()).toBeVisible();
  });

  test("11.5 Transaction count is displayed", async ({ page }) => {
    await expect(page.locator("text=/Showing \\d+ of \\d+/")).toBeVisible();
  });

  // Flow 12: Sort & Filter
  test("12.1 Type filter toggles work", async ({ page }) => {
    // Click Income filter
    await page.click('button:has-text("Income")');
    // Should only show income transactions
    await expect(
      page.locator("text=Residential Painting Revenue")
    ).toBeVisible();
    // Expense-only items should be hidden
    await expect(page.locator("text=Office Rent")).not.toBeVisible();
  });

  test("12.2 Status filter toggles work", async ({ page }) => {
    // Click Paused filter
    const pausedButton = page.locator('[aria-label="Filter by status"] button:has-text("Paused")');
    await pausedButton.click();
    // Should show paused transaction
    await expect(page.locator("text=Holiday Bonus Fund")).toBeVisible();
  });

  // Flow 13: CRUD Operations
  test("13.1 Add Transaction opens modal form", async ({ page }) => {
    await page.click("text=Add Transaction");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // Dialog heading has id="transaction-form-title"
    await expect(dialog.locator("#transaction-form-title")).toContainText("Add Transaction");
    await expect(page.locator("#txn-name")).toBeVisible();
    await expect(page.locator("#txn-amount")).toBeVisible();
    await expect(page.locator("#txn-frequency")).toBeVisible();
  });

  test("13.2 Form validation prevents empty submission", async ({ page }) => {
    await page.click("text=Add Transaction");
    await page.click('[role="dialog"] button:has-text("Add Transaction")');
    await expect(
      page.locator("text=Name is required (max 100 characters)")
    ).toBeVisible();
  });

  test("13.3 Edit button opens pre-filled modal", async ({ page }) => {
    const editButton = page.locator(
      '[aria-label="Edit Residential Painting Revenue"]'
    );
    await editButton.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator("#txn-name")).toHaveValue(
      "Residential Painting Revenue"
    );
  });

  test("13.4 Delete button shows confirmation dialog", async ({ page }) => {
    const deleteButton = page.locator(
      '[aria-label="Delete Residential Painting Revenue"]'
    );
    await deleteButton.click();
    await expect(
      page.locator("text=Delete Residential Painting Revenue?")
    ).toBeVisible();
  });

  // Flow 14: Bulk Actions
  test("14.1 Selecting transactions shows bulk action bar", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Bulk action checkboxes may not be accessible on mobile viewport");
    // Select first checkbox
    const checkbox = page.locator(
      'input[type="checkbox"][aria-label="Select Residential Painting Revenue"]'
    );
    await checkbox.check();
    await expect(page.locator("text=1 selected")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete", exact: true })).toBeVisible();
  });

  test("14.2 Select all checkbox selects all visible transactions", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Bulk action checkboxes may not be accessible on mobile viewport");
    const selectAll = page.locator(
      'input[type="checkbox"][aria-label="Select all transactions"]'
    );
    await selectAll.check();
    await expect(page.locator("text=/\\d+ selected/")).toBeVisible();
  });
});
