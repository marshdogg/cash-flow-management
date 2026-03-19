import {
  format,
  isToday,
  isYesterday,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  subWeeks,
  differenceInCalendarDays,
  addDays,
} from "date-fns";

/**
 * Format a date for display in the dashboard.
 * In production, this would use date-fns-tz formatInTimeZone.
 */
export function formatDashboardDate(date: Date | string, timezone?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format time for "Last update" display
 */
export function formatLastUpdate(date: Date): string {
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday " + format(date, "h:mm a");
  }
  return format(date, "MMM d, h:mm a");
}

/**
 * Check if data is stale (older than threshold)
 */
export function isDataStale(lastUpdate: Date, thresholdMs: number): boolean {
  return differenceInMinutes(new Date(), lastUpdate) * 60 * 1000 >= thresholdMs;
}

/**
 * Format due date for task items
 */
export function formatTaskDue(dueDate: string, daysOverdue: number, isOverdue: boolean): string {
  if (isOverdue) {
    return `${daysOverdue}d overdue`;
  }
  return "Due today";
}

// ============================================
// Week Selector Utilities
// ============================================

export interface WeekOption {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string;   // YYYY-MM-DD
  label: string;     // "Week of Mar 16 – Mar 22"
  isCurrent: boolean;
}

/**
 * Generate week options for current + N past weeks (Monday-based).
 */
export function generateWeekOptions(pastWeeks: number): WeekOption[] {
  const today = new Date();
  const options: WeekOption[] = [];

  for (let i = 0; i <= pastWeeks; i++) {
    const refDate = subWeeks(today, i);
    const ws = startOfWeek(refDate, { weekStartsOn: 1 });
    const we = endOfWeek(refDate, { weekStartsOn: 1 });

    options.push({
      weekStart: format(ws, "yyyy-MM-dd"),
      weekEnd: format(we, "yyyy-MM-dd"),
      label: `Week of ${format(ws, "MMM d")} – ${format(we, "MMM d")}`,
      isCurrent: i === 0,
    });
  }

  return options;
}

/**
 * Days until next ritual is due (7 days after last ritual).
 * Positive = upcoming, zero/negative = overdue.
 */
export function daysUntilNextRitual(lastRitualDate: string | null): number | null {
  if (!lastRitualDate) return null;
  const nextDue = addDays(new Date(lastRitualDate), 7);
  return differenceInCalendarDays(nextDue, new Date());
}
