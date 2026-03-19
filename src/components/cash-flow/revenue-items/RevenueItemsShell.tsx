"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useRevenueItems } from "@/hooks/useRevenueItems";
import { useFranchisePicker } from "@/hooks/useFranchisePicker";
import { RevenueItemsTable } from "./RevenueItemsTable";
import { SkeletonCard } from "@/components/cash-flow/shared/SkeletonCard";
import {
  CASH_FLOW_ROUTES,
  REVENUE_CATEGORY_COLORS,
} from "@/constants/cash-flow";
import type {
  CashFlowUserRole,
  AssignedFranchise,
  RevenueCategory,
  RevenueItem,
  RevenueItemStatus,
  RevenueItemSortField,
  RevenueWeek,
  SortDirection,
} from "@/types/cash-flow";
import { REVENUE_WEEK_OPTIONS } from "@/constants/cash-flow";

interface RevenueItemsShellProps {
  franchiseId: string;
  franchiseName: string;
  userRole: CashFlowUserRole;
  assignedFranchises?: AssignedFranchise[];
}

type CategoryFilter = "all" | RevenueCategory;
type StatusFilter = "all" | "open" | "collected" | "lost";
type WeekFilter = "all" | "this" | "next" | "future";

function getItemWeekBucket(item: RevenueItem): "past" | "this" | "next" | "future" {
  const now = new Date();
  const expected = new Date(item.expectedDate + "T00:00:00");
  const diffDays = Math.floor((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < -6) return "past";
  if (diffDays < 1) return "this";
  if (diffDays < 8) return "next";
  return "future";
}

function RevenueItemsInner({
  franchiseId: defaultFranchiseId,
  franchiseName,
  userRole,
  assignedFranchises = [],
}: RevenueItemsShellProps) {
  const isFom = userRole === "fom";
  const { selectedFranchise, setSelectedFranchise, franchises } =
    useFranchisePicker(
      isFom
        ? assignedFranchises
        : [{ id: defaultFranchiseId, name: franchiseName }]
    );
  const activeFranchiseId = selectedFranchise?.id ?? defaultFranchiseId;

  const { items, meta, isLoading, error, updateItem, deleteItems } =
    useRevenueItems(activeFranchiseId);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [weekFilter, setWeekFilter] = useState<WeekFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ field: RevenueItemSortField; direction: SortDirection }>({
    field: "expectedDate",
    direction: "asc",
  });
  const [editingItem, setEditingItem] = useState<RevenueItem | null>(null);

  // Filter
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((i) => i.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "lost") {
        filtered = filtered.filter((i) => i.status === "lost" || i.status === "cancelled");
      } else {
        filtered = filtered.filter((i) => i.status === statusFilter);
      }
    }

    if (weekFilter !== "all") {
      if (weekFilter === "future") {
        filtered = filtered.filter((i) => {
          const bucket = getItemWeekBucket(i);
          return bucket === "future" || bucket === "next";
        });
      } else {
        filtered = filtered.filter((i) => getItemWeekBucket(i) === weekFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => i.note.toLowerCase().includes(q));
    }

    return filtered;
  }, [items, categoryFilter, statusFilter, weekFilter, searchQuery]);

  // Sort
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    const dir = sort.direction === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sort.field) {
        case "note":
          return dir * a.note.localeCompare(b.note);
        case "category":
          return dir * a.category.localeCompare(b.category);
        case "grossAmount":
          return dir * (a.grossAmount - b.grossAmount);
        case "adjustedAmount":
          return dir * (a.adjustedAmount - b.adjustedAmount);
        case "expectedDate":
          return dir * a.expectedDate.localeCompare(b.expectedDate);
        case "status":
          return dir * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredItems, sort]);

  const handleSortChange = useCallback(
    (field: RevenueItemSortField) => {
      setSort((prev) =>
        prev.field === field
          ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
          : { field, direction: "asc" }
      );
    },
    []
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = sortedItems.map((i) => i.id);
      const allSelected = allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  }, [sortedItems]);

  const handleUpdateStatus = useCallback(
    async (item: RevenueItem, status: RevenueItemStatus) => {
      await updateItem(item.id, { status });
    },
    [updateItem]
  );

  const handleDelete = useCallback(
    async (item: RevenueItem) => {
      await deleteItems([item.id]);
    },
    [deleteItems]
  );

  const handleEdit = useCallback((item: RevenueItem) => {
    setEditingItem(item);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: { note: string; grossAmount: number; expectedDate: string; week: RevenueWeek }) => {
      if (!editingItem) return;
      await updateItem(editingItem.id, data);
      setEditingItem(null);
    },
    [editingItem, updateItem]
  );

  const handleBulkCollect = useCallback(async () => {
    await Promise.all(
      Array.from(selectedIds).map((id) => updateItem(id, { status: "collected" }))
    );
    setSelectedIds(new Set());
  }, [selectedIds, updateItem]);

  const handleBulkDelete = useCallback(async () => {
    await deleteItems(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds, deleteItems]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <SkeletonCard lines={12} />
      </div>
    );
  }

  if (error && !items.length) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-xl border border-danger-100 bg-danger-50 p-6 text-center">
        <p className="text-sm text-danger-600">
          Unable to load revenue items. Check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Page Header */}
      <div className="fade-up mb-5 flex items-start justify-between" style={{ animationDelay: "0.05s" }}>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#1a1a1a]">
            Revenue Items
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-[#6b7280]">
            All revenue entries across AR, sales, and proposals — by week
          </p>
          {isFom && franchises.length > 0 && (
            <select
              value={activeFranchiseId}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="mt-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-[#6b7280] focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              aria-label="Select franchise"
            >
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href={CASH_FLOW_ROUTES.ritual}
            className="flex items-center gap-[7px] rounded-[9px] border-[1.5px] border-[#ebebeb] bg-white px-4 py-[9px] text-[13px] font-bold text-[#6b7280] transition-all hover:border-[#c5e49a] hover:bg-[#f1f8e9] hover:text-[#3d6b14]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12" /><circle cx="8" cy="8" r="6.5" /></svg>
            Weekly Ritual
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="fade-up overflow-hidden rounded-[14px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]"
        style={{ animationDelay: "0.15s" }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f4f3f1] px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-5">
            {/* Category filter */}
            <div className="flex items-center gap-[6px]">
              <span className="mr-0.5 text-[12px] font-semibold text-[#6b7280]">Category:</span>
              <FilterPill active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>
                All
              </FilterPill>
              <FilterPill
                active={categoryFilter === "ar"}
                onClick={() => setCategoryFilter("ar")}
                dotColor={REVENUE_CATEGORY_COLORS.ar.dotColor}
              >
                AR <span className="text-[10px] opacity-80">({meta.arCount})</span>
              </FilterPill>
              <FilterPill
                active={categoryFilter === "sales"}
                onClick={() => setCategoryFilter("sales")}
                dotColor={REVENUE_CATEGORY_COLORS.sales.dotColor}
              >
                Sales <span className="text-[10px] opacity-80">({meta.salesCount})</span>
              </FilterPill>
              <FilterPill
                active={categoryFilter === "proposal"}
                onClick={() => setCategoryFilter("proposal")}
                dotColor={REVENUE_CATEGORY_COLORS.proposal.dotColor}
              >
                Proposals <span className="text-[10px] opacity-80">({meta.proposalCount})</span>
              </FilterPill>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-[6px]">
              <span className="mr-0.5 text-[12px] font-semibold text-[#6b7280]">Status:</span>
              <FilterPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                All
              </FilterPill>
              <FilterPill active={statusFilter === "open"} onClick={() => setStatusFilter("open")}>
                Open
              </FilterPill>
              <FilterPill active={statusFilter === "collected"} onClick={() => setStatusFilter("collected")}>
                Collected
              </FilterPill>
              <FilterPill active={statusFilter === "lost"} onClick={() => setStatusFilter("lost")}>
                Lost / Cancelled
              </FilterPill>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Week tabs */}
            <div className="flex gap-1 rounded-lg bg-[#f4f3f1] p-[3px]">
              {(
                [
                  { key: "all", label: "All weeks" },
                  { key: "this", label: "This week" },
                  { key: "next", label: "Next week" },
                  { key: "future", label: "Future" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setWeekFilter(tab.key)}
                  className={cn(
                    "whitespace-nowrap rounded-md px-2.5 py-[5px] text-[11px] font-bold transition-all",
                    weekFilter === tab.key
                      ? "bg-white text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                      : "text-[#6b7280] hover:text-[#6b7280]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-[9px] border-[1.5px] border-[#ebebeb] bg-[#f4f3f1] px-3 py-[7px] transition-all focus-within:border-[#8BC34A] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(139,195,74,0.1)]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="flex-shrink-0 text-[#6b7280]"
              >
                <circle cx="6.5" cy="6.5" r="4" />
                <path d="M10.5 10.5l3 3" />
              </svg>
              <input
                type="text"
                placeholder="Search items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search revenue items"
                className="w-[170px] border-none bg-transparent text-[12px] font-medium text-[#1a1a1a] outline-none placeholder:text-[#6b7280]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {sortedItems.length > 0 ? (
          <RevenueItemsTable
            items={sortedItems}
            sort={sort}
            onSortChange={handleSortChange}
            onUpdateStatus={handleUpdateStatus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            userRole={userRole}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <div className="min-h-[200px] px-8 py-14 text-center">
            <div className="text-[36px]">📋</div>
            <h3 className="mt-3 text-[16px] font-extrabold tracking-[-0.02em] text-[#1a1a1a]">
              {items.length === 0 ? "No revenue items yet" : "No items match your filters"}
            </h3>
            <p className="mt-1.5 text-[13px] font-medium text-[#6b7280]">
              {items.length === 0
                ? "Complete a weekly ritual to populate revenue items."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#f4f3f1] bg-[#f4f3f1] px-5 py-3">
          <div className="text-[12px] font-medium text-[#6b7280]">
            Showing <strong className="text-[#6b7280]">{sortedItems.length}</strong> of{" "}
            <strong className="text-[#6b7280]">{items.length}</strong> items
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#6b7280]">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkCollect}
                className="flex items-center gap-[5px] rounded-[7px] border-[1.5px] border-[#ebebeb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#6b7280] transition-all hover:border-[#c5e49a] hover:text-[#3d6b14]"
              >
                ✅ Mark collected
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-[5px] rounded-[7px] border-[1.5px] border-[#ebebeb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#6b7280] transition-all hover:border-[#fecaca] hover:text-[#ef4444]"
              >
                🗑 Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <RevenueItemEditModal
          item={editingItem}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

function RevenueItemEditModal({
  item,
  onSubmit,
  onClose,
}: {
  item: RevenueItem;
  onSubmit: (data: { note: string; grossAmount: number; expectedDate: string; week: RevenueWeek }) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(item.note);
  const [grossAmount, setGrossAmount] = useState(item.grossAmount.toString());
  const [expectedDate, setExpectedDate] = useState(item.expectedDate.split("T")[0]);
  const [week, setWeek] = useState<RevenueWeek>(item.week);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const focusTrapRef = useFocusTrap(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!note.trim()) newErrors.note = "Note is required";
    const num = parseFloat(grossAmount);
    if (isNaN(num) || num <= 0) newErrors.grossAmount = "Enter a positive amount";
    if (!expectedDate) newErrors.expectedDate = "Enter a valid date";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({ note: note.trim(), grossAmount: num, expectedDate, week });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={focusTrapRef} className="relative z-10 w-full max-w-[440px] rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2 className="text-lg font-bold text-neutral-800">Edit Revenue Item</h2>
          <button onClick={onClose} className="text-xl text-neutral-400 hover:text-neutral-600" aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <label htmlFor="edit-note" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Note <span className="text-danger-600">*</span>
              </label>
              <input
                id="edit-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={cn(
                  "block w-full rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e6b]",
                  errors.note ? "border-danger-600" : "border-neutral-200"
                )}
              />
              {errors.note && <p className="mt-1 text-xs text-danger-600">{errors.note}</p>}
            </div>
            <div>
              <label htmlFor="edit-amount" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                Gross Amount <span className="text-danger-600">*</span>
              </label>
              <input
                id="edit-amount"
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
                <label htmlFor="edit-date" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Expected Date <span className="text-danger-600">*</span>
                </label>
                <input
                  id="edit-date"
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
                <label htmlFor="edit-week" className="mb-1.5 block text-[13px] font-semibold text-neutral-500">
                  Week
                </label>
                <select
                  id="edit-week"
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
              className="rounded-md bg-primary-500 px-[18px] py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  dotColor,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dotColor?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-[5px] rounded-full border-[1.5px] px-3 py-1 text-[12px] font-semibold transition-all",
        active
          ? "border-[#5a8c1f] bg-[#5a8c1f] text-white shadow-[0_1px_4px_rgba(90,140,31,0.3)]"
          : "border-[#ebebeb] text-[#6b7280] hover:border-[#c5e49a] hover:bg-[#f1f8e9] hover:text-[#3d6b14]"
      )}
    >
      {dotColor && !active && (
        <span
          className="h-[7px] w-[7px] flex-shrink-0 rounded-[2px]"
          style={{ background: dotColor }}
        />
      )}
      {children}
    </button>
  );
}

export function RevenueItemsShell(props: RevenueItemsShellProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px]">
          <SkeletonCard lines={12} />
        </div>
      }
    >
      <RevenueItemsInner {...props} />
    </Suspense>
  );
}
