"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { REVENUE_WEEK_OPTIONS } from "@/constants/cash-flow";
import type { RevenueCategory, RevenueItem, RevenueWeek } from "@/types/cash-flow";

interface RevenueItemFormModalProps {
  item?: RevenueItem;
  defaultCategory?: RevenueCategory;
  defaultWeek?: RevenueWeek;
  onSubmit: (data: {
    note: string;
    grossAmount: number;
    expectedDate: string;
    week: RevenueWeek;
    category?: RevenueCategory;
  }) => void | Promise<void>;
  onClose: () => void;
}

export function RevenueItemFormModal({
  item,
  defaultCategory = "ar",
  defaultWeek = "w0",
  onSubmit,
  onClose,
}: RevenueItemFormModalProps) {
  const isEdit = !!item;
  const [note, setNote] = useState(item?.note ?? "");
  const [category, setCategory] = useState<RevenueCategory>(item?.category ?? defaultCategory);
  const [grossAmount, setGrossAmount] = useState(item ? item.grossAmount.toString() : "");
  const [expectedDate, setExpectedDate] = useState(item ? item.expectedDate.split("T")[0] : "");
  const [week, setWeek] = useState<RevenueWeek>(item?.week ?? defaultWeek);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const focusTrapRef = useFocusTrap(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const newErrors: Record<string, string> = {};
    if (!note.trim()) newErrors.note = "Note is required";
    const num = parseFloat(grossAmount);
    if (isNaN(num) || num <= 0) newErrors.grossAmount = "Enter a positive amount";
    if (!expectedDate) newErrors.expectedDate = "Enter a valid date";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await onSubmit({ note: note.trim(), grossAmount: num, expectedDate, week });
      } else {
        await onSubmit({ note: note.trim(), category, grossAmount: num, expectedDate, week });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={focusTrapRef} className="relative z-10 w-full max-w-[520px] rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2 className="text-lg font-bold text-neutral-800">
            {isEdit ? "Edit Revenue Item" : "Add Revenue Item"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <label htmlFor="rev-note" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Note <span className="text-danger-600">*</span>
              </label>
              <input
                id="rev-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                autoFocus
                className={cn(
                  "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                  errors.note ? "border-danger-600" : "border-neutral-200"
                )}
              />
              {errors.note && <p className="mt-1 text-xs text-danger-600">{errors.note}</p>}
            </div>
            {!isEdit && (
              <div>
                <label htmlFor="rev-category" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Category <span className="text-danger-600">*</span>
                </label>
                <select
                  id="rev-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RevenueCategory)}
                  className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                >
                  <option value="ar">AR</option>
                  <option value="sales">Sales</option>
                  <option value="proposal">Proposal</option>
                </select>
              </div>
            )}
            <div>
              <label htmlFor="rev-amount" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Gross Amount <span className="text-danger-600">*</span>
              </label>
              <input
                id="rev-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                className={cn(
                  "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                  errors.grossAmount ? "border-danger-600" : "border-neutral-200"
                )}
              />
              {errors.grossAmount && <p className="mt-1 text-xs text-danger-600">{errors.grossAmount}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="rev-date" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Expected Date <span className="text-danger-600">*</span>
                </label>
                <input
                  id="rev-date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className={cn(
                    "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                    errors.expectedDate ? "border-danger-600" : "border-neutral-200"
                  )}
                />
                {errors.expectedDate && <p className="mt-1 text-xs text-danger-600">{errors.expectedDate}</p>}
              </div>
              <div>
                <label htmlFor="rev-week" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Week
                </label>
                <select
                  id="rev-week"
                  value={week}
                  onChange={(e) => setWeek(e.target.value as RevenueWeek)}
                  className="block w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]"
                >
                  {REVENUE_WEEK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-200 bg-white px-[18px] py-2.5 text-[13.5px] font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary-500 px-[18px] py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
