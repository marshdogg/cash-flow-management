import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";

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
