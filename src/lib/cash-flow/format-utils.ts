import type { HealthStatus } from "@/types/cash-flow";
import { HEALTH_LABELS } from "@/constants/cash-flow";

/**
 * Format a numeric value as currency.
 * PRD §6.1: Prefix $, 2 decimal places. Negative: −$X,XXX.XX
 */
export function formatCurrency(value: number | null): string {
  if (value === null) return "—";

  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (value < 0) return `−$${formatted}`;
  return `$${formatted}`;
}

/**
 * Format currency with explicit +/- prefix.
 * PRD §6.2: Positive: +$X,XXX.XX, Negative: −$X,XXX.XX, Zero: $0.00
 */
export function formatSignedCurrency(value: number): string {
  if (value === 0) return "$0.00";

  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (value > 0) return `+$${formatted}`;
  return `−$${formatted}`;
}

/**
 * Centralized metric value formatter with null handling.
 * Returns "—" for null values with optional subtitle.
 */
export function formatMetricValue(
  value: number | null,
  formatter: (v: number) => string = formatCurrency
): string {
  if (value === null) return "—";
  return formatter(value);
}

/**
 * Format a health status for display.
 * PRD §6.4: Returns the human-readable label.
 */
export function formatHealthStatus(status: HealthStatus): string {
  return HEALTH_LABELS[status];
}

/**
 * Format a date as relative time ("3 days ago", "Today", etc.).
 */
export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Format a date for display in tables and cards.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get the CSS color class for a net cash flow value.
 * PRD §6.2: Positive = green, Negative = red, Zero = neutral
 */
export function getNetFlowColor(value: number): string {
  if (value > 0) return "text-success-600";
  if (value < 0) return "text-danger-600";
  return "text-neutral-700";
}

/**
 * Get the CSS color class for a TCP value.
 * PRD §6.1: Negative = red, otherwise default
 */
export function getTcpColor(value: number | null): string {
  if (value === null) return "text-neutral-400";
  if (value < 0) return "text-danger-600";
  return "text-neutral-700";
}

/**
 * Format currency in compact form for chart axes: $5k, $10k, $1.5M
 */
export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    const k = value / 1_000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${value}`;
}
