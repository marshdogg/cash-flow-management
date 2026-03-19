import type {
  HealthStatus,
  RecurringTransaction,
  ProjectionWeek,
  TransactionFrequency,
  CashFlowBreakdown,
  CashFlowPeriod,
} from "@/types/cash-flow";
import {
  FREQUENCY_WEEKLY_DIVISORS,
  HEALTH_CRITICAL_THRESHOLD,
  HEALTH_CAUTION_THRESHOLD,
  PROJECTION_WEEKS,
  PROJECTION_CONFIDENCE_BAND,
  RUNWAY_CAP,
  BAR_CHART_WEEKS,
} from "@/constants/cash-flow";
import { addWeeks, addMonths, addYears, format, startOfWeek } from "date-fns";

/**
 * Normalize a transaction amount to a weekly equivalent.
 * Amount is always positive in the database; type determines sign.
 */
export function normalizeToWeekly(
  amount: number,
  frequency: TransactionFrequency
): number {
  const divisor = FREQUENCY_WEEKLY_DIVISORS[frequency];
  return amount / divisor;
}

/**
 * Calculate pending inflows for the next 7 days.
 * PRD §6.1: Sum of active recurring income where nextOccurrence ≤ today + 7 days.
 */
export function calculatePendingInflows(
  transactions: RecurringTransaction[],
  referenceDate: Date = new Date()
): number {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() + 7);

  return transactions
    .filter(
      (t) =>
        t.type === "income" &&
        t.status === "active" &&
        new Date(t.nextOccurrence) <= cutoff
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate pending outflows for the next 7 days.
 * PRD §6.1: Sum of active recurring expenses where nextOccurrence ≤ today + 7 days.
 */
export function calculatePendingOutflows(
  transactions: RecurringTransaction[],
  referenceDate: Date = new Date()
): number {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() + 7);

  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.status === "active" &&
        new Date(t.nextOccurrence) <= cutoff
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate True Cash Position.
 * PRD §6.1: TCP = Bank Balance + Pending Inflows − Pending Outflows
 */
export function calculateTCP(
  bankBalance: number | null,
  transactions: RecurringTransaction[],
  referenceDate?: Date
): number | null {
  if (bankBalance === null) return null;

  const inflows = calculatePendingInflows(transactions, referenceDate);
  const outflows = calculatePendingOutflows(transactions, referenceDate);

  return bankBalance + inflows - outflows;
}

/**
 * Calculate total weekly recurring income.
 * PRD §6.2: Sum of all active recurring income, normalized to weekly.
 */
export function calculateWeeklyIncome(
  transactions: RecurringTransaction[]
): number {
  return transactions
    .filter((t) => t.type === "income" && t.status === "active")
    .reduce((sum, t) => sum + normalizeToWeekly(t.amount, t.frequency), 0);
}

/**
 * Calculate total weekly recurring expenses.
 * PRD §6.2: Sum of all active recurring expenses, normalized to weekly.
 */
export function calculateWeeklyExpenses(
  transactions: RecurringTransaction[]
): number {
  return transactions
    .filter((t) => t.type === "expense" && t.status === "active")
    .reduce((sum, t) => sum + normalizeToWeekly(t.amount, t.frequency), 0);
}

/**
 * Calculate Net Weekly Cash Flow.
 * PRD §6.2: Weekly Income − Weekly Expenses
 */
export function calculateNetWeeklyCashFlow(
  transactions: RecurringTransaction[]
): number {
  return calculateWeeklyIncome(transactions) - calculateWeeklyExpenses(transactions);
}

/**
 * Calculate Weeks of Runway.
 * PRD §6.3: TCP ÷ |Weekly Expenses|
 * Returns null for infinity (zero expenses).
 */
export function calculateWeeksOfRunway(
  tcp: number | null,
  weeklyExpenses: number
): number | null {
  if (tcp === null) return null;

  // PRD §6.3: Negative TCP → 0.0 weeks
  if (tcp < 0) return 0;

  // PRD §6.3: Division-by-zero → infinity (null)
  if (weeklyExpenses === 0) return null;

  const runway = tcp / Math.abs(weeklyExpenses);

  // PRD §6.3: Cap at 999.9
  return Math.min(runway, RUNWAY_CAP);
}

/**
 * Determine Health Status from Weeks of Runway.
 * PRD §6.4:
 *   - Critical: < 4.0 weeks
 *   - Caution: ≥ 4.0 and < 8.0 weeks
 *   - Healthy: ≥ 8.0 weeks
 *   - Not Available: null TCP
 */
export function calculateHealthStatus(
  tcp: number | null,
  weeklyExpenses: number
): HealthStatus {
  if (tcp === null) return "not_available";

  // PRD §6.4: Negative TCP → Critical regardless
  if (tcp < 0) return "critical";

  const runway = calculateWeeksOfRunway(tcp, weeklyExpenses);

  // null runway = infinity (zero expenses) → Healthy
  if (runway === null) return "healthy";

  if (runway < HEALTH_CRITICAL_THRESHOLD) return "critical";
  if (runway < HEALTH_CAUTION_THRESHOLD) return "caution";
  return "healthy";
}

/**
 * Generate 13-week projection data.
 * PRD §6.5: TCP + (Net Weekly Cash Flow × week_number) for weeks 1-13
 * Confidence bands: ±10% of Net Weekly Cash Flow applied cumulatively.
 */
export function generateProjection(
  tcp: number | null,
  netWeeklyCashFlow: number
): ProjectionWeek[] | null {
  if (tcp === null) return null;

  const weeks: ProjectionWeek[] = [];
  const bandPerWeek = Math.abs(netWeeklyCashFlow) * PROJECTION_CONFIDENCE_BAND;

  for (let week = 0; week <= PROJECTION_WEEKS; week++) {
    const projected = tcp + netWeeklyCashFlow * week;
    const cumulativeBand = bandPerWeek * week;

    weeks.push({
      week,
      projected: Math.round(projected * 100) / 100,
      upperBound: Math.round((projected + cumulativeBand) * 100) / 100,
      lowerBound: Math.round((projected - cumulativeBand) * 100) / 100,
    });
  }

  return weeks;
}

/**
 * Format Weeks of Runway for display.
 * PRD §6.3: "∞" for infinity, "X.X weeks" for values, cap at "999.9+ weeks".
 */
export function formatRunway(weeksOfRunway: number | null): string {
  if (weeksOfRunway === null) return "∞";
  if (weeksOfRunway >= RUNWAY_CAP) return `${RUNWAY_CAP}+ weeks`;
  return `${weeksOfRunway.toFixed(1)} weeks`;
}

// ============================================
// Bar Chart Breakdown
// ============================================

/**
 * Advance a date by one period of the given frequency.
 */
function advanceDate(date: Date, frequency: TransactionFrequency): Date {
  switch (frequency) {
    case "weekly":
      return addWeeks(date, 1);
    case "biweekly":
      return addWeeks(date, 2);
    case "semimonthly":
      return addWeeks(date, 2); // approximate: ~twice per month
    case "monthly":
      return addMonths(date, 1);
    case "quarterly":
      return addMonths(date, 3);
    case "annually":
      return addYears(date, 1);
  }
}

/**
 * Generate per-week and per-month income/expense breakdown
 * by simulating when each recurring transaction occurs over the next 12 weeks.
 */
export function generateBreakdown(
  bankBalance: number | null,
  transactions: RecurringTransaction[],
  referenceDate: Date = new Date()
): CashFlowBreakdown | null {
  if (bankBalance === null) return null;

  const activeTransactions = transactions.filter((t) => t.status === "active");
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday

  // Build 12 weekly period boundaries
  const weekBoundaries: Date[] = [];
  for (let i = 0; i <= BAR_CHART_WEEKS; i++) {
    weekBoundaries.push(addWeeks(weekStart, i));
  }

  // Initialize weekly buckets
  const weeklyIncome = new Array(BAR_CHART_WEEKS).fill(0);
  const weeklyExpense = new Array(BAR_CHART_WEEKS).fill(0);

  // For each active transaction, simulate occurrences across the 12-week window
  const windowEnd = weekBoundaries[BAR_CHART_WEEKS];

  for (const txn of activeTransactions) {
    let occurrence = new Date(txn.nextOccurrence);

    // If the next occurrence is before the window start, advance it
    while (occurrence < weekStart) {
      occurrence = advanceDate(occurrence, txn.frequency);
    }

    // Walk forward and bucket each occurrence
    while (occurrence < windowEnd) {
      // Find which week this falls into
      for (let w = 0; w < BAR_CHART_WEEKS; w++) {
        if (occurrence >= weekBoundaries[w] && occurrence < weekBoundaries[w + 1]) {
          if (txn.type === "income") {
            weeklyIncome[w] += txn.amount;
          } else {
            weeklyExpense[w] += txn.amount;
          }
          break;
        }
      }
      occurrence = advanceDate(occurrence, txn.frequency);
    }
  }

  // Build weekly periods with running balance
  const weeks: CashFlowPeriod[] = [];
  let runningBalance = bankBalance;

  for (let i = 0; i < BAR_CHART_WEEKS; i++) {
    const net = weeklyIncome[i] - weeklyExpense[i];
    runningBalance += net;

    weeks.push({
      index: i + 1,
      label: `Wk ${i + 1}`,
      startDate: weekBoundaries[i].toISOString(),
      income: Math.round(weeklyIncome[i] * 100) / 100,
      expense: Math.round(weeklyExpense[i] * 100) / 100,
      net: Math.round(net * 100) / 100,
      runningBalance: Math.round(runningBalance * 100) / 100,
      isProjected: i > 0, // week 1 is current, rest projected
    });
  }

  // Aggregate into 3 monthly periods (4 weeks each)
  const months: CashFlowPeriod[] = [];
  let monthRunning = bankBalance;

  for (let m = 0; m < 3; m++) {
    const startIdx = m * 4;
    const endIdx = Math.min(startIdx + 4, BAR_CHART_WEEKS);
    let monthIncome = 0;
    let monthExpense = 0;

    for (let w = startIdx; w < endIdx; w++) {
      monthIncome += weeklyIncome[w];
      monthExpense += weeklyExpense[w];
    }

    const monthNet = monthIncome - monthExpense;
    monthRunning += monthNet;

    months.push({
      index: m + 1,
      label: format(weekBoundaries[startIdx], "MMM"),
      startDate: weekBoundaries[startIdx].toISOString(),
      income: Math.round(monthIncome * 100) / 100,
      expense: Math.round(monthExpense * 100) / 100,
      net: Math.round(monthNet * 100) / 100,
      runningBalance: Math.round(monthRunning * 100) / 100,
      isProjected: m > 0,
    });
  }

  const totalIncome = weeks.reduce((s, w) => s + w.income, 0);
  const totalExpense = weeks.reduce((s, w) => s + w.expense, 0);

  return {
    openingBalance: bankBalance,
    weeks,
    months,
    totals: {
      income: Math.round(totalIncome * 100) / 100,
      expense: Math.round(totalExpense * 100) / 100,
      projectedBalance: Math.round((bankBalance + totalIncome - totalExpense) * 100) / 100,
    },
  };
}
