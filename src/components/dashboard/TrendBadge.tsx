"use client";

import { cn } from "@/lib/cn";

interface TrendBadgeProps {
  direction: "up" | "down" | "flat" | "new";
  percentage: number | null;
}

export function TrendBadge({ direction, percentage }: TrendBadgeProps) {
  if (direction === "flat" && (percentage === 0 || percentage === null)) return null;

  const config = {
    up: { symbol: "↑", color: "text-success-600", label: "Trending up" },
    down: { symbol: "↓", color: "text-danger-600", label: "Trending down" },
    flat: { symbol: "→", color: "text-gray-500", label: "No change" },
    new: { symbol: "↑", color: "text-gray-500", label: "New" },
  };

  const { symbol, color, label } = config[direction];

  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium", color)}
      aria-label={label}
    >
      <span aria-hidden="true">{symbol}</span>
      {direction === "new" ? "New" : percentage !== null ? `${Math.abs(percentage)}%` : null}
    </span>
  );
}
