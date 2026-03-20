"use client";

import type { WizardRecurringExpense } from "@/types/cash-flow";

interface RecurringExpensesStepProps {
  expenses: WizardRecurringExpense[];
  onToggle: (transactionId: string) => void;
}

function fmt(n: number): string {
  return "$" + n.toLocaleString();
}

export function RecurringExpensesStep({ expenses, onToggle }: RecurringExpensesStepProps) {
  const total = expenses.filter((e) => e.checked).reduce((s, e) => s + e.amount, 0);

  return (
    <>
      {/* Soft band */}
      <div className="border-b border-[#f2f1ef] border-l-[3px] border-l-[#8BC34A] bg-[#f7f6f3] px-8 py-6">
        <div className="text-[22px] font-bold tracking-[-0.03em] text-[#1a1a1a]">
          Review recurring expenses
        </div>
        <div className="mt-1 text-[13px] text-[#6b7280]">
          Confirm or adjust recurring costs for this week. Uncheck anything that won&apos;t apply.
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-7">
        {/* Expense list */}
        <div className="flex flex-col gap-2">
          {expenses.map((exp) => (
            <div
              key={exp.transactionId}
              className="flex items-center gap-3 rounded-[10px] border border-[#e8e8e5] bg-white px-4 py-3 transition-colors hover:border-[#c5e49a]"
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => onToggle(exp.transactionId)}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A] ${
                  exp.checked
                    ? "border border-[#8BC34A] bg-[#8BC34A] text-white"
                    : "border border-[#e8e8e5] bg-white"
                }`}
                aria-label={`${exp.checked ? "Uncheck" : "Check"} ${exp.name}`}
              >
                {exp.checked && "✓"}
              </button>

              {/* Icon */}
              <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg bg-[#f2f1ef] text-[15px]">
                {exp.icon}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[#1a1a1a]">{exp.name}</div>
                <div className="mt-px text-[11px] font-medium text-[#a0aab4]">{exp.meta}</div>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 font-mono text-sm font-semibold text-[#ef4444]">
                −{fmt(exp.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between rounded-[12px] border-[2px] border-[#fecaca] bg-[#fef2f2] px-5 py-4">
          <div className="text-[13px] font-bold text-[#1a1a1a]">Total Recurring This Week</div>
          <div className="font-mono text-xl font-bold text-[#ef4444]">
            −{fmt(total)}
          </div>
        </div>
      </div>
    </>
  );
}
