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
    <div className="flex items-center gap-3 border-b border-[#e8f5e0] bg-[#fafff5] px-6 py-3">
      <label
        htmlFor="week-selector"
        className="text-[13px] font-semibold text-[#3d6b14]"
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
        className="rounded-[8px] border border-[#c5e49a] bg-white px-3 py-1.5 text-[13px] font-medium text-[#3d6b14] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
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
