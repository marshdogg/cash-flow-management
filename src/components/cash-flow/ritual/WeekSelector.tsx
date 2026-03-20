"use client";

import { generateWeekOptions } from "@/lib/date-utils";
import { WEEK_SELECTOR_PAST_WEEKS } from "@/constants/cash-flow";

interface WeekSelectorProps {
  weekStart: string;
  onWeekChange: (weekStart: string, weekEnd: string) => void;
}

export function WeekSelector({ weekStart, onWeekChange }: WeekSelectorProps) {
  const options = generateWeekOptions(WEEK_SELECTOR_PAST_WEEKS);

  return (
    <div className="flex items-center gap-3 border-b border-[#e5e7eb] bg-[#f4f3f1] px-6 py-3">
      <label
        htmlFor="week-selector"
        className="text-[13px] font-semibold text-[#6b7280]"
      >
        Ritual week:
      </label>
      <select
        id="week-selector"
        value={weekStart}
        onChange={(e) => {
          const selected = options.find((o) => o.weekStart === e.target.value);
          if (selected) onWeekChange(selected.weekStart, selected.weekEnd);
        }}
        className="rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-medium text-[#1a1a1a] focus-visible:border-[#8BC34A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A]/30"
      >
        {options.map((opt) => (
          <option key={opt.weekStart} value={opt.weekStart}>
            {opt.label}
            {opt.isCurrent ? " (current)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
