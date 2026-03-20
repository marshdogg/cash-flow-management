"use client";

import { useState, useCallback } from "react";
import type { WizardOneOffExpense } from "@/types/cash-flow";

interface OneOffExpensesStepProps {
  expenses: WizardOneOffExpense[];
  onToggleChecked: (id: string) => void;
  onToggleMakeRecurring: (id: string) => void;
  onAdd: (description: string, amount: number, icon?: string) => void;
  onRemove: (id: string) => void;
}

function fmt(n: number): string {
  return "$" + n.toLocaleString();
}

export function OneOffExpensesStep({
  expenses,
  onToggleChecked,
  onToggleMakeRecurring,
  onAdd,
  onRemove,
}: OneOffExpensesStepProps) {
  const total = expenses.filter((e) => e.checked).reduce((s, e) => s + e.amount, 0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmt, setNewAmt] = useState("");

  const handleAdd = useCallback(() => {
    const amount = parseInt(newAmt.replace(/[^0-9]/g, "")) || 0;
    if (newDesc.trim() && amount > 0) {
      onAdd(newDesc.trim(), amount, "📋");
      setNewDesc("");
      setNewAmt("");
      setShowAddForm(false);
    }
  }, [newDesc, newAmt, onAdd]);

  return (
    <>
      {/* Soft band */}
      <div className="border-b border-[#f2f1ef] border-l-[3px] border-l-[#8BC34A] bg-[#f7f6f3] px-8 py-6">
        <div className="text-[22px] font-bold tracking-[-0.03em] text-[#1a1a1a]">
          Any one-off expenses this week?
        </div>
        <div className="mt-1 text-[13px] text-[#6b7280]">
          Add unplanned or irregular costs. Promote to recurring if they&apos;ll repeat.
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-7">
        {/* Expense list */}
        <div className="flex flex-col gap-2">
          {expenses.map((exp) => (
            <div key={exp.id}>
              {/* Item row */}
              <div className="flex items-center gap-3 rounded-t-[10px] border border-b-0 border-[#e8e8e5] bg-white px-4 py-3 transition-colors hover:border-[#c5e49a]">
                <button
                  type="button"
                  onClick={() => onToggleChecked(exp.id)}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A] ${
                    exp.checked
                      ? "border border-[#8BC34A] bg-[#8BC34A] text-white"
                      : "border border-[#e8e8e5] bg-white"
                  }`}
                >
                  {exp.checked && "✓"}
                </button>
                <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg bg-[#f2f1ef] text-[15px]">
                  {exp.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-[#1a1a1a]">{exp.description}</div>
                  <div className="mt-px text-[11px] font-medium text-[#a0aab4]">One-off</div>
                </div>
                <div className="flex-shrink-0 font-mono text-sm font-semibold text-[#ef4444]">
                  −{fmt(exp.amount)}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(exp.id)}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-[#e8e8e5] text-[11px] text-[#a0aab4] transition-colors hover:border-[#ef4444] hover:bg-[#fef2f2] hover:text-[#ef4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A]"
                  aria-label={`Remove ${exp.description}`}
                >
                  ✕
                </button>
              </div>

              {/* Make recurring row */}
              <div className="flex items-center gap-2.5 rounded-b-[10px] border border-[#fde68a] bg-[#fffbeb] px-3.5 py-2.5">
                <label className="relative inline-flex h-[18px] w-[34px] flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={exp.makeRecurring}
                    onChange={() => onToggleMakeRecurring(exp.id)}
                  />
                  <div className="absolute inset-0 rounded-[10px] bg-[#d1d5db] transition-colors peer-checked:bg-[#8BC34A]" />
                  <div className="absolute left-[3px] top-[3px] h-3 w-3 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                </label>
                <span className="text-xs font-semibold text-[#92400e]">
                  Make this a recurring expense
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAddForm ? (
          <div className="flex flex-col gap-2 rounded-[10px] border border-[#e8e8e5] bg-white p-4">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description"
              className="min-h-[44px] rounded-lg border border-[#e8e8e5] px-3 py-2 text-[13px] font-semibold text-[#1a1a1a] outline-none placeholder:text-[#a0aab4] focus-visible:border-[#8BC34A] focus-visible:ring-2 focus-visible:ring-[#8BC34A]/15"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-[#e8e8e5] focus-within:border-[#8BC34A] focus-within:ring-2 focus-within:ring-[#8BC34A]/15">
                <div className="border-r border-[#e8e8e5] bg-[#f2f1ef] px-2 py-2 font-mono text-xs font-bold text-[#6b7280]">
                  $
                </div>
                <input
                  type="text"
                  value={newAmt}
                  onChange={(e) => setNewAmt(e.target.value)}
                  placeholder="0"
                  className="min-h-[44px] w-full border-none bg-transparent px-2 py-2 font-mono text-[13px] font-semibold text-[#1a1a1a] outline-none placeholder:text-[#a0aab4]"
                />
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="min-h-[44px] rounded-lg bg-[#8BC34A] px-4 py-2 text-xs font-bold text-white hover:bg-[#6a9e32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A] focus-visible:ring-offset-2"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="min-h-[44px] rounded-lg border border-[#e8e8e5] px-3 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f7f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex w-full items-center gap-2 rounded-[10px] border border-dashed border-[#e8e8e5] bg-transparent px-4 py-3 text-[13px] font-semibold text-[#6b7280] transition-all hover:border-[#8BC34A] hover:bg-[#f1f8e9] hover:text-[#3d6b14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M8 2v12M2 8h12" />
            </svg>
            Add one-off expense
          </button>
        )}

        {/* Subtotal */}
        <div className="flex items-center justify-between rounded-[12px] border-[2px] border-[#fecaca] bg-[#fef2f2] px-5 py-4">
          <div className="text-[13px] font-bold text-[#1a1a1a]">Total One-Off Expenses</div>
          <div className="font-mono text-xl font-bold text-[#ef4444]">
            −{fmt(total)}
          </div>
        </div>
      </div>
    </>
  );
}
