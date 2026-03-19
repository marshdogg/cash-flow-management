"use client";

import { cn } from "@/lib/cn";
import { TrendBadge } from "./TrendBadge";
import type { KpiData, KpiVariant } from "@/types/dashboard";
import { PROGRESS_BAR_MAX_VISUAL } from "@/constants/dashboard";

interface KpiCardProps {
  label: string;
  data: KpiData;
  variant?: KpiVariant;
  onClick?: () => void;
}

export function KpiCard({ label, data, variant = "standard", onClick }: KpiCardProps) {
  const isNull = data.value === null || data.value === undefined;
  const isNegative = !isNull && (data.value as number) < 0;
  const displayValue = isNull ? "—" : (data.formattedValue || "—");

  // Progress bar: capped at 100% — never extends beyond track
  const progressWidth = data.target && !isNull
    ? Math.min(data.target.achievement, PROGRESS_BAR_MAX_VISUAL)
    : 0;
  const isOverTarget = data.target ? data.target.achievement > 100 : false;

  const progressColor = data.alert
    ? "bg-danger-600"
    : isOverTarget
      ? "bg-success-600"
      : data.target && data.target.achievement >= 80
        ? "bg-primary-500"
        : "bg-warning-500";

  // Accessible label with null handling
  const ariaLabel = isNull
    ? `${label}: no data available`
    : data.target
      ? `${label}: ${data.formattedValue}, ${data.target.achievement}% of target`
      : `${label}: ${data.formattedValue}`;

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "relative w-full rounded-lg border p-5 text-left transition-all",
        "hover:shadow-md hover:border-gray-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        variant === "standard" && "bg-white border-gray-200",
        variant === "highlight" && "bg-gradient-to-b from-success-50 to-white border-primary-500 border-2",
        variant === "alert" && "bg-gradient-to-b from-danger-50 to-white border-danger-600 border-2"
      )}
    >
      {/* Trend badge — top right (hidden when value is null) */}
      {!isNull && (
        <div className="absolute top-3 right-4">
          <TrendBadge direction={data.trend.direction} percentage={data.trend.percentage} />
        </div>
      )}

      {/* Label */}
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>

      {/* Value */}
      <p
        className={cn(
          "mt-1 text-kpi-value",
          isNull ? "text-gray-500" : isNegative ? "text-danger-600" : "text-gray-900"
        )}
      >
        {displayValue}
      </p>

      {/* Target + Progress (hidden when value is null or negative) */}
      {data.target && !isNull && !isNegative && (
        <div className="mt-2">
          <p className="text-[11px] text-gray-500">
            Target: {data.target.value.toLocaleString("en-US")}
          </p>
          <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn("absolute left-0 top-0 h-full rounded-full transition-all", progressColor)}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p
            className={cn(
              "mt-1 text-right text-[11px] font-medium",
              isOverTarget ? "text-success-600" : "text-gray-500"
            )}
          >
            {data.target.achievement}%
          </p>
        </div>
      )}

      {/* No target — Set target link (hidden when value is null) */}
      {!data.target && !isNull && data.formattedValue !== "" && (
        <p className="mt-2 text-[11px] text-primary-500">Set target →</p>
      )}
    </button>
  );
}
