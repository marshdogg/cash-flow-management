"use client";

import { cn } from "@/lib/cn";
import { PERIODS } from "@/constants/dashboard";
import type { PeriodId } from "@/types/dashboard";

interface PeriodSelectorProps {
  activePeriod: PeriodId;
  onPeriodChange: (period: PeriodId) => void;
  disabled?: boolean;
}

export function PeriodSelector({ activePeriod, onPeriodChange, disabled }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="Time period">
      {PERIODS.map((period) => (
        <button
          key={period.id}
          onClick={() => onPeriodChange(period.id)}
          disabled={disabled}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            activePeriod === period.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-pressed={activePeriod === period.id}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
