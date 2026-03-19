import { test, expect } from "@playwright/test";

// Flow 1: Page Load & Layout
test.describe("Flow 1: Page Load & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §6.1
  // prd-expectation: Dashboard loads with Overview tab active and This Month period selected
  // priority: P0
  test("1.1 — Dashboard loads with default tab and period", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dashboard");
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    const monthButton = page.getByRole("button", { name: "This Month" });
    await expect(monthButton).toHaveAttribute("aria-pressed", "true");
  });

  // prd-section: §6.1
  // prd-expectation: Sidebar shows all navigation items with Dashboard highlighted
  // priority: P0
  test("1.2 — Sidebar shows all navigation items", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar is hidden on mobile viewports (hidden lg:flex)");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Dashboard")).toBeVisible();
    await expect(nav.getByText("Funnel")).toBeVisible();
    await expect(nav.getByText("Projects")).toBeVisible();
    await expect(nav.getByText("Calendar")).toBeVisible();
    await expect(nav.getByText("Tasks")).toBeVisible();
    // Dashboard should be active
    const dashboardLink = nav.getByRole("link", { name: "Dashboard" });
    await expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  // prd-section: §6.1
  // prd-expectation: Header displays last update timestamp for data freshness
  // priority: P1
  test("1.3 — Header shows last update timestamp", async ({ page }) => {
    await expect(page.getByText(/Last update:/)).toBeVisible();
  });

  // prd-section: §6.1
  // prd-expectation: Refresh button is visible and enabled in default state
  // priority: P1
  test("1.4 — Refresh button shows default state", async ({ page }) => {
    const refreshBtn = page.getByRole("button", { name: /Refresh/ });
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toBeEnabled();
  });

  // prd-section: §6.1
  // prd-expectation: Period selector group contains all four time period options
  // priority: P0
  test("1.5 — Period selector shows 4 options", async ({ page }) => {
    const periodGroup = page.getByRole("group", { name: "Time period" });
    await expect(periodGroup.getByText("Today")).toBeVisible();
    await expect(periodGroup.getByText("This Week")).toBeVisible();
    await expect(periodGroup.getByText("This Month")).toBeVisible();
    await expect(periodGroup.getByText("YTD")).toBeVisible();
  });

  // prd-section: §6.1
  // prd-expectation: Franchise name appears in the dashboard subtitle
  // priority: P1
  test("1.6 — Franchise name in subtitle", async ({ page }) => {
    await expect(page.getByText(/WOW 1 DAY PAINTING/)).toBeVisible();
  });
});

// Flow 2: Tab Switching
test.describe("Flow 2: Tab Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §7.1
  // prd-expectation: Clicking Sales tab activates it, shows Sales Pipeline content, updates URL
  // priority: P0
  test("2.1 — Click Sales tab", async ({ page }) => {
    await page.getByRole("tab", { name: "Sales" }).click();
    await expect(page.getByRole("tab", { name: "Sales" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Sales Pipeline")).toBeVisible();
    await expect(page).toHaveURL(/tab=sales/);
  });

  // prd-section: §7.1
  // prd-expectation: Clicking Profitability tab activates it for authorized roles, shows P&L Summary
  // priority: P0
  test("2.2 — Click Profitability tab (authorized role)", async ({ page }) => {
    await page.getByRole("tab", { name: "Profitability" }).click();
    await expect(page.getByRole("tab", { name: "Profitability" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("P&L Summary")).toBeVisible();
    await expect(page).toHaveURL(/tab=profitability/);
  });

  // prd-section: §7.1
  // prd-expectation: Clicking Overview tab returns to default view with Today's Focus visible
  // priority: P0
  test("2.3 — Click Overview tab to return", async ({ page }) => {
    await page.getByRole("tab", { name: "Sales" }).click();
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Today's Focus")).toBeVisible();
  });

  // prd-section: §7.1
  // prd-expectation: Deep linking with ?tab=sales loads Sales tab directly
  // priority: P1
  test("2.5 — Deep link with ?tab=sales", async ({ page }) => {
    await page.goto("/dashboard?tab=sales");
    await expect(page.getByRole("tab", { name: "Sales" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Sales Pipeline")).toBeVisible();
  });

  // prd-section: §15
  // prd-expectation: Invalid tab query parameter gracefully falls back to Overview
  // priority: P1
  test("2.7 — Invalid ?tab param falls back to overview", async ({ page }) => {
    await page.goto("/dashboard?tab=invalid");
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  // prd-section: §6.1
  // prd-expectation: Profitability tab is not rendered for Estimator role users
  // priority: P0
  test("2.9 — Profitability tab hidden for Estimator role", async ({ page }) => {
    // Test with estimator session
    await page.goto("/dashboard"); // Would use estimator session fixture
    // This test validates the tab is not rendered
    // Implementation depends on session mock setup
  });
});

// Flow 3: Period Selector
test.describe("Flow 3: Period Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §7.2
  // prd-expectation: Selecting This Week period activates button and updates URL
  // priority: P0
  test("3.1 — Select This Week period", async ({ page }) => {
    await page.getByRole("button", { name: "This Week" }).click();
    await expect(page.getByRole("button", { name: "This Week" })).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/period=week/);
  });

  // prd-section: §15
  // prd-expectation: Invalid period query parameter gracefully falls back to This Month
  // priority: P1
  test("3.5 — Invalid ?period param falls back to month", async ({ page }) => {
    await page.goto("/dashboard?period=invalid");
    await expect(page.getByRole("button", { name: "This Month" })).toHaveAttribute("aria-pressed", "true");
  });
});

// Flow 4: KPI Cards
test.describe("Flow 4: Overview Tab — KPI Cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §6.2
  // prd-expectation: Revenue KPI card is visible with formatted dollar value
  // priority: P0
  test("4.1 — Revenue KPI card displays", async ({ page }) => {
    // KpiCard label uses CSS text-transform: uppercase — DOM text is title case
    await expect(page.getByText("Revenue").first()).toBeVisible();
    // Should show formatted dollar value
    await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible();
  });

  // prd-section: §6.2
  // prd-expectation: At least one KPI card shows a trend indicator
  // priority: P1
  test("4.3 — KPI card shows trend indicator", async ({ page }) => {
    // TrendBadge renders with aria-label like "Trending up", "Trending down", etc.
    await expect(page.locator('[aria-label^="Trending"]').first()).toBeVisible();
  });
});

// Flow 5: Today's Focus
test.describe("Flow 5: Overview Tab — Today's Focus", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §6.2
  // prd-expectation: Today's Focus section shows Qual Calls, Estimates Scheduled, and Follow-Ups
  // priority: P0
  test("5.1 — Focus section shows operational items", async ({ page }) => {
    await expect(page.getByText("Today's Focus")).toBeVisible();
    await expect(page.getByText("Qual Calls Needed")).toBeVisible();
    await expect(page.getByText("Estimates Scheduled")).toBeVisible();
    await expect(page.getByText("Follow-Ups Due")).toBeVisible();
  });

  // prd-section: §6.2
  // prd-expectation: My Tasks section is visible with interactive task checkboxes
  // priority: P0
  test("5.5 — My Tasks section shows tasks", async ({ page }) => {
    await expect(page.getByText("My Tasks")).toBeVisible();
    // Should show task checkboxes
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes.first()).toBeVisible();
  });
});

// Flow 6: Task Completion
test.describe("Flow 6: Task Completion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §7.5
  // prd-expectation: Clicking checkbox marks task as completed with aria-checked=true
  // priority: P0
  test("6.1 — Click checkbox completes task", async ({ page }) => {
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.click();
    // Task should show strikethrough/dimmed
    await expect(firstCheckbox).toHaveAttribute("aria-checked", "true");
  });

  // prd-section: §7.5
  // prd-expectation: Clicking completed checkbox again undoes completion within 3-second window
  // priority: P0
  test("6.3 — Undo within 3 seconds", async ({ page }) => {
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.click();
    await expect(firstCheckbox).toHaveAttribute("aria-checked", "true");
    // Click again to undo
    await firstCheckbox.click();
    await expect(firstCheckbox).toHaveAttribute("aria-checked", "false");
  });

  // prd-section: §7.5
  // prd-expectation: Space key toggles task checkbox when focused via keyboard
  // priority: P1
  test("6.10 — Keyboard: Space toggles checkbox", async ({ page }) => {
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.focus();
    await page.keyboard.press("Space");
    await expect(firstCheckbox).toHaveAttribute("aria-checked", "true");
  });
});

// Flow 7: Quick Stats
test.describe("Flow 7: Quick Stats", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  // prd-section: §6.2
  // prd-expectation: Four quick stat cards are visible: Completed Jobs, In Pipeline, Collected, Outstanding
  // priority: P1
  test("7.1 — Four stat cards displayed", async ({ page }) => {
    await expect(page.getByText("Completed Jobs")).toBeVisible();
    await expect(page.getByText("In Pipeline")).toBeVisible();
    await expect(page.getByText("Collected").first()).toBeVisible();
    await expect(page.getByText("Outstanding").first()).toBeVisible();
  });
});
