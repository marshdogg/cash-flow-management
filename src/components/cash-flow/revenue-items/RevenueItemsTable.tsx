"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/cash-flow/format-utils";
import {
  REVENUE_CATEGORY_LABELS,
  REVENUE_CATEGORY_ICONS,
  REVENUE_CATEGORY_COLORS,
  REVENUE_STATUS_LABELS,
  REVENUE_STATUS_COLORS,
} from "@/constants/cash-flow";
import type {
  RevenueItem,
  RevenueItemSortField,
  RevenueItemStatus,
  SortDirection,
  CashFlowUserRole,
} from "@/types/cash-flow";

interface RevenueItemsTableProps {
  items: RevenueItem[];
  sort: { field: RevenueItemSortField; direction: SortDirection };
  onSortChange: (field: RevenueItemSortField) => void;
  onUpdateStatus: (item: RevenueItem, status: RevenueItemStatus) => void;
  onEdit: (item: RevenueItem) => void;
  onDelete: (item: RevenueItem) => void;
  userRole: CashFlowUserRole;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

const COLUMNS: { field: RevenueItemSortField; label: string; hideOnMobile?: boolean }[] = [
  { field: "note", label: "Item / Note" },
  { field: "category", label: "Category" },
  { field: "grossAmount", label: "Gross Amount" },
  { field: "adjustedAmount", label: "Adjusted Amount", hideOnMobile: true },
  { field: "expectedDate", label: "Expected Week" },
  { field: "status", label: "Status" },
];


function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWeekLabel(item: RevenueItem, now: Date): { label: string; type: "this" | "next" | "later" | "past" } {
  const expected = new Date(item.expectedDate + "T00:00:00");
  const diffDays = Math.floor((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < -6) return { label: formatDate(item.expectedDate), type: "past" };
  if (diffDays < 1) return { label: "This week", type: "this" };
  if (diffDays < 8) return { label: "Next week", type: "next" };
  return { label: formatDate(item.expectedDate), type: "later" };
}

function isOverdue(item: RevenueItem, now: Date): boolean {
  if (item.status !== "open") return false;
  const expected = new Date(item.expectedDate + "T00:00:00");
  return expected.getTime() < now.getTime() - 6 * 24 * 60 * 60 * 1000;
}

const WEEK_CHIP_STYLES = {
  this: "bg-[#f1f8e9] text-[#3d6b14] border-[#c5e49a]",
  next: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  later: "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  past: "bg-[#faf5f5] text-[#9ca3af] border-[#f3e8e8]",
};

const WEEK_EMOJI = {
  this: "📅",
  next: "📆",
  later: "🗓",
  past: "🗓",
};

function KebabMenu({
  item,
  onUpdateStatus,
  onEdit,
  onDelete,
}: {
  item: RevenueItem;
  onUpdateStatus: (item: RevenueItem, status: RevenueItemStatus) => void;
  onEdit: (item: RevenueItem) => void;
  onDelete: (item: RevenueItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus first menu item when opened
      requestAnimationFrame(() => {
        const firstBtn = menuRef.current?.querySelector<HTMLButtonElement>("button[role='menuitem']");
        firstBtn?.focus();
      });
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>("button[role='menuitem']");
    if (!items || items.length === 0) return;
    const current = Array.from(items).indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(current + 1) % items.length].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(current - 1 + items.length) % items.length].focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f4f3f1] hover:text-[#1a1a1a]"
        aria-label={`Actions for ${item.note}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
      {open && (
        <div ref={menuRef} role="menu" onKeyDown={handleMenuKeyDown} className="absolute right-0 z-50 mt-1 min-w-[172px] rounded-[10px] border border-[#e5e7eb] bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">
          {item.status === "open" && (
            <>
              <button
                role="menuitem"
                onClick={() => { onUpdateStatus(item, "collected"); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f1f8e9] hover:text-[#3d6b14]"
              >
                {item.category === "proposal" ? "🏆 Mark won" : "✅ Mark collected"}
              </button>
              <button
                role="menuitem"
                onClick={() => { onEdit(item); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f4f3f1] hover:text-[#1a1a1a]"
              >
                ✏️ Edit
              </button>
              <div className="my-1 h-px bg-[#f4f3f1]" />
              <button
                role="menuitem"
                onClick={() => { onUpdateStatus(item, item.category === "proposal" ? "lost" : "cancelled"); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
              >
                {item.category === "proposal" ? "❌ Mark lost" : "❌ Mark cancelled"}
              </button>
            </>
          )}
          {(item.status === "collected" || item.status === "cancelled" || item.status === "lost") && (
            <>
              <button
                role="menuitem"
                onClick={() => { onUpdateStatus(item, "open"); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#f4f3f1] hover:text-[#1a1a1a]"
              >
                ↩️ Reopen
              </button>
              <div className="my-1 h-px bg-[#f4f3f1]" />
              <button
                role="menuitem"
                onClick={() => { onDelete(item); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
              >
                🗑 Delete
              </button>
            </>
          )}
          {item.status === "open" && (
            <button
              role="menuitem"
              onClick={() => { onDelete(item); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-semibold text-[#6b7280] transition-all hover:bg-[#fef2f2] hover:text-[#ef4444]"
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RevenueItemsTable({
  items,
  sort,
  onSortChange,
  onUpdateStatus,
  onEdit,
  onDelete,
  userRole,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: RevenueItemsTableProps) {
  const isFom = userRole === "fom";
  const allSelected =
    items.length > 0 && items.every((t) => selectedIds.has(t.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f4f3f1]">
            {!isFom && (
              <th className="w-11 px-4 py-2.5">
                <div
                  onClick={onSelectAll}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onSelectAll(); } }}
                  tabIndex={0}
                  className={cn(
                    "flex h-4 w-4 cursor-pointer items-center justify-center rounded border text-[9px] transition-all",
                    allSelected
                      ? "border-[#8BC34A] bg-[#8BC34A] text-white"
                      : "border-[#e5e7eb] hover:border-[#8BC34A]"
                  )}
                  role="checkbox"
                  aria-checked={allSelected}
                  aria-label="Select all items"
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
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSortChange(col.field); } }}
                tabIndex={0}
                aria-sort={sort.field === col.field ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
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
            {!isFom && <th className="w-12 px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {(() => {
            const now = new Date();
            return items.map((item) => {
            const catColors = REVENUE_CATEGORY_COLORS[item.category];
            const statusColors = REVENUE_STATUS_COLORS[item.status];
            const icon = REVENUE_CATEGORY_ICONS[item.category];
            const isSelected = selectedIds.has(item.id);
            const weekInfo = getWeekLabel(item, now);
            const overdue = isOverdue(item, now);
            const isInactive = item.status === "collected" || item.status === "lost" || item.status === "cancelled";

            return (
              <tr
                key={item.id}
                className="border-b border-[#f4f3f1] last:border-b-0 hover:bg-[#fafaf8]"
                style={isInactive ? { opacity: item.status === "collected" ? 0.7 : 0.6 } : undefined}
              >
                {!isFom && (
                  <td className="w-11 px-4 py-3.5">
                    <div
                      onClick={() => onToggleSelect(item.id)}
                      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onToggleSelect(item.id); } }}
                      tabIndex={0}
                      className={cn(
                        "flex h-4 w-4 cursor-pointer items-center justify-center rounded border text-[9px] transition-all",
                        isSelected
                          ? "border-[#8BC34A] bg-[#8BC34A] text-white"
                          : "border-[#e5e7eb] hover:border-[#8BC34A]"
                      )}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Select ${item.note}`}
                    >
                      {isSelected && "✓"}
                    </div>
                  </td>
                )}
                {/* Name */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[15px]"
                      style={{
                        background: catColors.iconBg,
                        opacity: isInactive ? 0.6 : 1,
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold leading-tight text-[#1a1a1a]">
                        {item.note}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-[#6b7280]">
                        Ritual: {formatDate(item.ritualDate)} · {REVENUE_CATEGORY_LABELS[item.category].split(" ")[0]}
                        {item.status === "collected" && item.collectedDate && ` · Collected ${formatDate(item.collectedDate)}`}
                        {item.status === "cancelled" && " · Cancelled"}
                        {item.status === "lost" && " · Lost"}
                      </div>
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="px-4 py-3.5">
                  <span
                    className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[11px] font-semibold"
                    style={{
                      background: catColors.bg,
                      borderColor: catColors.border,
                      color: catColors.text,
                    }}
                  >
                    <span
                      className="h-[7px] w-[7px] flex-shrink-0 rounded-[2px]"
                      style={{ background: catColors.dotColor }}
                    />
                    {REVENUE_CATEGORY_LABELS[item.category]}
                  </span>
                </td>
                {/* Gross Amount */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <div className="font-mono tabular-nums text-[13px] font-semibold text-[#1a1a1a]">
                    {formatCurrency(item.grossAmount)}
                  </div>
                </td>
                {/* Adjusted Amount */}
                <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell">
                  <div className="font-mono tabular-nums text-[13px] font-semibold text-[#4a7a18]">
                    {item.adjustedAmount > 0 ? formatCurrency(item.adjustedAmount) : "—"}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-[#6b7280]">
                    {item.status === "collected" ? "Fully collected" :
                     item.status === "cancelled" ? "Cancelled" :
                     item.status === "lost" ? "Lost" :
                     item.category === "ar" ? `${item.adjustmentRate}% collection rate` :
                     item.category === "sales" ? `${item.adjustmentRate}% (${100 - item.adjustmentRate}% cancel rate)` :
                     `${item.adjustmentRate}% close rate`}
                  </div>
                </td>
                {/* Expected Week */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
                      WEEK_CHIP_STYLES[weekInfo.type]
                    )}
                  >
                    {WEEK_EMOJI[weekInfo.type]} {weekInfo.label}
                  </span>
                  {overdue && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-[#fde68a] bg-[#fffbeb] px-1.5 py-0.5 text-[11px] font-semibold text-[#92400e]">
                      ⚠ Overdue
                    </span>
                  )}
                </td>
                {/* Status */}
                <td className="px-4 py-3.5">
                  <span
                    className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: statusColors.bg,
                      borderColor: statusColors.border,
                      color: statusColors.text,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: statusColors.dot }}
                    />
                    {REVENUE_STATUS_LABELS[item.status]}
                  </span>
                </td>
                {/* Actions */}
                {!isFom && (
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <KebabMenu
                        item={item}
                        onUpdateStatus={onUpdateStatus}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                )}
              </tr>
            );
          });
          })()}
        </tbody>
      </table>
    </div>
  );
}
