"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/cash-flow/format-utils";
import {
  FREQUENCY_EMOJI_LABELS,
  CATEGORY_ICONS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
  TRANSACTION_TYPE_BG,
  SOON_PILL_DAYS,
} from "@/constants/cash-flow";
import type {
  RecurringTransaction,
  SortField,
  TableSort,
  CashFlowUserRole,
} from "@/types/cash-flow";

interface TransactionTableProps {
  transactions: RecurringTransaction[];
  sort: TableSort;
  onSortChange: (field: SortField) => void;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (transaction: RecurringTransaction) => void;
  onTogglePause: (transaction: RecurringTransaction) => void;
  userRole: CashFlowUserRole;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

const COLUMNS: { field: SortField; label: string; hideOnMobile?: boolean }[] = [
  { field: "name", label: "Name" },
  { field: "type", label: "Type" },
  { field: "amount", label: "Amount" },
  { field: "frequency", label: "Frequency", hideOnMobile: true },
  { field: "nextOccurrence", label: "Next Occurrence", hideOnMobile: true },
  { field: "status", label: "Status" },
];

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function KebabMenu({
  transaction,
  onEdit,
  onDelete,
  onTogglePause,
}: {
  transaction: RecurringTransaction;
  onEdit: (t: RecurringTransaction) => void;
  onDelete: (t: RecurringTransaction) => void;
  onTogglePause: (t: RecurringTransaction) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f4f3f1] hover:text-[#1a1a1a]"
        aria-label={`Actions for ${transaction.name}`}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-[10px] border border-[#e5e7eb] bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => {
              onEdit(transaction);
              setOpen(false);
            }}
            aria-label={`Edit ${transaction.name}`}
            className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-semibold text-[#6b7280] transition-all hover:bg-[#f4f3f1] hover:text-[#1a1a1a]"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              onTogglePause(transaction);
              setOpen(false);
            }}
            aria-label={
              transaction.status === "active"
                ? `Pause ${transaction.name}`
                : `Resume ${transaction.name}`
            }
            className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-semibold text-[#6b7280] transition-all hover:bg-[#f4f3f1] hover:text-[#1a1a1a]"
          >
            {transaction.status === "active" ? "⏸ Pause" : "▶️ Resume"}
          </button>
          <div className="my-1 h-px bg-[#f4f3f1]" />
          <button
            onClick={() => {
              onDelete(transaction);
              setOpen(false);
            }}
            aria-label={`Delete ${transaction.name}`}
            className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-semibold text-[#6b7280] transition-all hover:bg-[#fef2f2] hover:text-[#ef4444]"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function TransactionTable({
  transactions,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onTogglePause,
  userRole,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: TransactionTableProps) {
  const isFom = userRole === "fom";
  const allSelected =
    transactions.length > 0 &&
    transactions.every((t) => selectedIds.has(t.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f4f3f1]">
            {/* Checkbox */}
            {!isFom && (
              <th className="w-11 px-4 py-2.5">
                <div
                  onClick={onSelectAll}
                  className={cn(
                    "flex h-4 w-4 cursor-pointer items-center justify-center rounded border text-[9px] transition-all",
                    allSelected
                      ? "border-[#8BC34A] bg-[#8BC34A] text-white"
                      : "border-[#e5e7eb] hover:border-[#8BC34A]"
                  )}
                  role="checkbox"
                  aria-checked={allSelected}
                  aria-label="Select all transactions"
                >
                  {allSelected && "✓"}
                </div>
              </th>
            )}
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                className={cn(
                  "cursor-pointer select-none whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6b7280]",
                  col.hideOnMobile && "hidden sm:table-cell"
                )}
                onClick={() => onSortChange(col.field)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <span
                    className={cn(
                      "inline-flex flex-col gap-px",
                      sort.field === col.field
                        ? "text-[#3d6b14] opacity-100"
                        : "opacity-40"
                    )}
                  >
                    <svg width="6" height="4" viewBox="0 0 6 4">
                      <path d="M3 0L6 4H0L3 0Z" fill="currentColor" />
                    </svg>
                    <svg
                      width="6"
                      height="4"
                      viewBox="0 0 6 4"
                      style={{ transform: "rotate(180deg)" }}
                    >
                      <path d="M3 0L6 4H0L3 0Z" fill="currentColor" />
                    </svg>
                  </span>
                </span>
              </th>
            ))}
            {/* Actions header */}
            {!isFom && <th className="w-12 px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const days = daysUntil(txn.nextOccurrence);
            const isSoon = days >= 0 && days <= SOON_PILL_DAYS;
            const icon =
              CATEGORY_ICONS[txn.category ?? "other"] || "📋";
            const isSelected = selectedIds.has(txn.id);

            return (
              <tr
                key={txn.id}
                className="border-b border-[#f4f3f1] transition-colors last:border-b-0 hover:bg-[#fafaf8]"
                style={
                  txn.status === "paused" ? { opacity: 0.55 } : undefined
                }
              >
                {/* Checkbox */}
                {!isFom && (
                  <td className="w-11 px-4 py-3.5">
                    <div
                      onClick={() => onToggleSelect(txn.id)}
                      className={cn(
                        "flex h-4 w-4 cursor-pointer items-center justify-center rounded border text-[9px] transition-all",
                        isSelected
                          ? "border-[#8BC34A] bg-[#8BC34A] text-white"
                          : "border-[#e5e7eb] hover:border-[#8BC34A]"
                      )}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Select ${txn.name}`}
                    >
                      {isSelected && "✓"}
                    </div>
                  </td>
                )}
                {/* Name */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] text-base",
                        txn.type === "income"
                          ? "bg-[#f1f8e9]"
                          : "bg-[#fef2f2]"
                      )}
                    >
                      {icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold leading-tight text-[#1a1a1a]">
                        {txn.name}
                      </div>
                      {txn.description && (
                        <div className="mt-0.5 text-[11px] font-medium text-[#6b7280]">
                          {txn.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {/* Type */}
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.02em]",
                      txn.type === "expense"
                        ? "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
                        : "border-[#c5e49a] bg-[#f1f8e9] text-[#3d6b14]"
                    )}
                  >
                    {TRANSACTION_TYPE_LABELS[txn.type]}
                  </span>
                </td>
                {/* Amount */}
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-sm font-semibold">
                  <span
                    className={
                      txn.type === "expense"
                        ? "text-[#ef4444]"
                        : "text-[#6a9e32]"
                    }
                  >
                    {txn.type === "income" ? "+" : "−"}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                {/* Frequency */}
                <td className="hidden px-4 py-3.5 sm:table-cell">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#f4f3f1] px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
                    {FREQUENCY_EMOJI_LABELS[txn.frequency]}
                  </span>
                </td>
                {/* Next Occurrence */}
                <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isSoon ? "text-[#f59e0b]" : "text-[#6b7280]"
                    )}
                  >
                    {formatDate(txn.nextOccurrence)}
                  </span>
                  {isSoon && days >= 0 && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-[#fde68a] bg-[#fffbeb] px-1.5 py-0.5 text-[10px] font-bold text-[#92400e]">
                      ⚡ {days} day{days !== 1 ? "s" : ""}
                    </span>
                  )}
                </td>
                {/* Status */}
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                      txn.status === "active"
                        ? "border-[#c5e49a] bg-[#f1f8e9] text-[#6a9e32]"
                        : "border-[#e5e7eb] bg-[#f3f4f6] text-[#6b7280]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        txn.status === "active"
                          ? "bg-[#8BC34A]"
                          : "bg-[#d1d5db]"
                      )}
                    />
                    {txn.status === "active" ? "Active" : "Paused"}
                  </span>
                </td>
                {/* Actions */}
                {!isFom && (
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <KebabMenu
                        transaction={txn}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onTogglePause={onTogglePause}
                      />
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
