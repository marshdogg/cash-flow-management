"use client";

import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useRevenueItems } from "@/hooks/useRevenueItems";
import { useFranchisePicker } from "@/hooks/useFranchisePicker";
import { RevenueItemsTable } from "./RevenueItemsTable";
import { SkeletonCard } from "@/components/cash-flow/shared/SkeletonCard";
import { formatCurrency } from "@/lib/cash-flow/format-utils";
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
  CreateRevenueItemRequest,
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

function getItemWeekBucket(item: RevenueItem, now: Date): "past" | "this" | "next" | "future" {
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

  const { items, meta, isLoading, error, createItem, updateItem, deleteItems } =
    useRevenueItems(activeFranchiseId);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [weekFilter, setWeekFilter] = useState<WeekFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(id);
  }, [searchQuery]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ field: RevenueItemSortField; direction: SortDirection }>({
    field: "expectedDate",
    direction: "asc",
  });
  const [editingItem, setEditingItem] = useState<RevenueItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ category: RevenueCategory; week: RevenueWeek }>({ category: "ar", week: "w0" });

  // Filter
  const filteredItems = useMemo(() => {
    const now = new Date();
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
          const bucket = getItemWeekBucket(i, now);
          return bucket === "future" || bucket === "next";
        });
      } else {
        filtered = filtered.filter((i) => getItemWeekBucket(i, now) === weekFilter);
      }
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter((i) => i.note.toLowerCase().includes(q));
    }

    return filtered;
  }, [items, categoryFilter, statusFilter, weekFilter, debouncedSearch]);

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

  const handleCreate = useCallback(() => {
    setCreateDefaults({
      category: categoryFilter !== "all" ? categoryFilter : "ar",
      week: weekFilter === "next" ? "w1" : "w0",
    });
    setIsCreating(true);
  }, [categoryFilter, weekFilter]);

  const handleCreateSubmit = useCallback(
    async (data: { note: string; grossAmount: number; expectedDate: string; week: RevenueWeek; category?: RevenueCategory }) => {
      await createItem({ ...data, category: data.category ?? "ar" } as CreateRevenueItemRequest);
      setIsCreating(false);
    },
    [createItem]
  );

  // Summary stats (computed from all items, not filtered)
  const openItems = items.filter((i) => i.status === "open");
  const collectedItems = items.filter((i) => i.status === "collected");
  const totalOpen = openItems.reduce((s, i) => s + i.grossAmount, 0);
  const totalCollected = collectedItems.reduce((s, i) => s + i.grossAmount, 0);
  const collectionRate =
    meta.total > 0
      ? Math.round((collectedItems.length / meta.total) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] py-8">
        <SkeletonCard lines={12} />
      </div>
    );
  }

  if (error && !items.length) {
    return (
      <div className="mx-auto max-w-[1400px] py-8">
        <div className="rounded-xl border border-danger-100 bg-danger-50 p-6 text-center">
          <p className="text-sm text-danger-600">
            Unable to load revenue items. Check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] py-8">
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
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#1a1a1a]">
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
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-[9px] bg-[#8BC34A] px-[18px] py-2.5 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(139,195,74,0.3)] transition-all hover:-translate-y-px hover:bg-[#6a9e32] hover:shadow-[0_4px_14px_rgba(139,195,74,0.38)]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12" /></svg>
            Add Item
          </button>
          <Link
            href={CASH_FLOW_ROUTES.ritual}
            className="flex items-center gap-[7px] rounded-[9px] border border-[#e5e7eb] bg-white px-4 py-[9px] text-[13px] font-medium text-[#6b7280] transition-colors hover:border-[#c5e49a] hover:bg-[#f9fdf5] hover:text-[#4a7a18]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M2 6h12" /><path d="M5 2v4" /><path d="M11 2v4" /></svg>
            Weekly Ritual
          </Link>
        </div>
      </div>

      {/* Summary Strip */}
      {items.length > 0 && (
        <div
          className="fade-up mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          style={{ animationDelay: "0.1s" }}
        >
          <SummaryCard
            label="Total Gross Revenue"
            value={formatCurrency(meta.totalGross)}
            valueColor="text-[#1a1a1a]"
            sub={`${meta.total} item${meta.total !== 1 ? "s" : ""} across all categories`}
          />
          <SummaryCard
            label="Open Pipeline"
            value={formatCurrency(totalOpen)}
            valueColor="text-[#f59e0b]"
            sub={`${openItems.length} open item${openItems.length !== 1 ? "s" : ""}`}
          />
          <SummaryCard
            label="Collected"
            value={formatCurrency(totalCollected)}
            valueColor="text-[#6a9e32]"
            sub={`${collectedItems.length} collected item${collectedItems.length !== 1 ? "s" : ""}`}
          />
          <SummaryCard
            label="Collection Rate"
            value={`${collectionRate}%`}
            valueColor={collectionRate >= 50 ? "text-[#6a9e32]" : "text-[#f59e0b]"}
            sub="Collected vs total items"
          />
        </div>
      )}

      {/* Table Card */}
      <div
        className="fade-up overflow-hidden rounded-[14px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]"
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
                    "whitespace-nowrap rounded-md px-2.5 py-[5px] text-[11px] font-semibold transition-colors",
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
            <div className="flex items-center gap-2 rounded-[9px] border border-[#e5e7eb] bg-[#f4f3f1] px-3 py-[7px] transition-colors focus-within:border-[#8BC34A] focus-within:bg-white">
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
            <h3 className="mt-3 text-[16px] font-bold tracking-[-0.02em] text-[#1a1a1a]">
              {items.length === 0 ? "No revenue items yet" : "No items match your filters"}
            </h3>
            <p className="mt-1.5 text-[13px] font-medium text-[#6b7280]">
              {items.length === 0
                ? "Add an item directly or complete a weekly ritual to get started."
                : "Try adjusting your filters or search query."}
            </p>
            {items.length === 0 && (
              <button
                onClick={handleCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-[9px] bg-[#8BC34A] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(139,195,74,0.3)] transition-all hover:-translate-y-px hover:bg-[#6a9e32] hover:shadow-[0_4px_14px_rgba(139,195,74,0.38)]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12" /></svg>
                Add your first item
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#f4f3f1] bg-[#f4f3f1] px-5 py-3">
          <div className="text-[12px] font-medium text-[#6b7280]">
            Showing <strong className="text-[#1a1a1a]">{sortedItems.length}</strong> of{" "}
            <strong className="text-[#1a1a1a]">{items.length}</strong> items
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#6b7280]">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkCollect}
                className="flex items-center gap-[5px] rounded-[7px] border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-medium text-[#6b7280] transition-colors hover:border-[#c5e49a] hover:text-[#3d6b14]"
              >
                ✅ Mark collected
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-[5px] rounded-[7px] border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-medium text-[#6b7280] transition-colors hover:border-[#fecaca] hover:text-[#ef4444]"
              >
                🗑 Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <RevenueItemFormModal
          defaultCategory={createDefaults.category}
          defaultWeek={createDefaults.week}
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreating(false)}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <RevenueItemFormModal
          item={editingItem}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingItem(null)}
        />
      )}

    </div>
  );
}

function RevenueItemFormModal({
  item,
  defaultCategory = "ar",
  defaultWeek = "w0",
  onSubmit,
  onClose,
}: {
  item?: RevenueItem;
  defaultCategory?: RevenueCategory;
  defaultWeek?: RevenueWeek;
  onSubmit: (data: { note: string; grossAmount: number; expectedDate: string; week: RevenueWeek; category?: RevenueCategory }) => void | Promise<void>;
  onClose: () => void;
}) {
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
              {submitting ? "Saving..." : "Save"}
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
        "flex items-center gap-[5px] rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        active
          ? "border-[#8BC34A] bg-[#8BC34A] text-white"
          : "border-[#e5e7eb] text-[#6b7280] hover:border-[#c5e49a] hover:bg-[#f9fdf5] hover:text-[#3d6b14]"
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

function SummaryCard({
  label,
  value,
  valueColor,
  sub,
}: {
  label: string;
  value: string;
  valueColor: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[9px] border border-[#e5e7eb] bg-white px-[18px] py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[#c5e49a]">
      <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-[#6b7280]">
        {label}
      </div>
      <div className={cn("font-mono text-xl font-medium leading-none tracking-[-0.02em]", valueColor)}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-[#6b7280]">{sub}</div>
    </div>
  );
}

export function RevenueItemsShell(props: RevenueItemsShellProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] py-8">
          <SkeletonCard lines={12} />
        </div>
      }
    >
      <RevenueItemsInner {...props} />
    </Suspense>
  );
}
