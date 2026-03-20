"use client";

import { Suspense, useState, useCallback, useMemo, lazy } from "react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useFranchisePicker } from "@/hooks/useFranchisePicker";
import { useToast } from "@/hooks/useToast";
import { TransactionTable } from "./TransactionTable";

const TransactionForm = lazy(() =>
  import("./TransactionForm").then((m) => ({ default: m.TransactionForm }))
);
import { ConfirmDialog } from "@/components/cash-flow/shared/ConfirmDialog";
import { EmptyState } from "@/components/cash-flow/shared/EmptyState";
import { SkeletonCard } from "@/components/cash-flow/shared/SkeletonCard";
import { RoleGate } from "@/components/cash-flow/shared/RoleGate";
import {
  TOAST_MESSAGES,
  CONFIRM_MESSAGES,
  EMPTY_STATE_MESSAGES,
  FREQUENCY_WEEKLY_DIVISORS,
  COMING_UP_DAYS,
} from "@/constants/cash-flow";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/cash-flow/format-utils";
import type {
  RecurringTransaction,
  CashFlowUserRole,
  AssignedFranchise,
  SortField,
  TableSort,
  TypeFilter,
  StatusFilter,
  BulkAction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/types/cash-flow";

interface RecurringTransactionsShellProps {
  franchiseId: string;
  franchiseName: string;
  userRole: CashFlowUserRole;
  assignedFranchises?: AssignedFranchise[];
}

function normalizeToMonthly(amount: number, frequency: string): number {
  const divisor = FREQUENCY_WEEKLY_DIVISORS[frequency as keyof typeof FREQUENCY_WEEKLY_DIVISORS] ?? 4.33;
  return amount / (divisor / 4.33);
}


function RecurringTransactionsInner({
  franchiseId: defaultFranchiseId,
  franchiseName,
  userRole,
  assignedFranchises = [],
}: RecurringTransactionsShellProps) {
  const { showToast } = useToast();
  const isFom = userRole === "fom";

  const { selectedFranchise, setSelectedFranchise, franchises } =
    useFranchisePicker(
      isFom
        ? assignedFranchises
        : [{ id: defaultFranchiseId, name: franchiseName }]
    );

  const activeFranchiseId = selectedFranchise?.id ?? defaultFranchiseId;

  const {
    transactions,
    meta,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkAction,
  } = useRecurringTransactions(activeFranchiseId);

  // Local state
  const [sort, setSort] = useState<TableSort>({ field: "nextOccurrence", direction: "asc" });
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null);

  // Summary computations (always on ALL transactions)
  const activeExpenses = useMemo(
    () => transactions.filter((t) => t.status === "active" && t.type === "expense"),
    [transactions]
  );
  const activeIncomes = useMemo(
    () => transactions.filter((t) => t.status === "active" && t.type === "income"),
    [transactions]
  );
  const totalMonthlyOutflow = useMemo(
    () => activeExpenses.reduce((sum, t) => sum + normalizeToMonthly(t.amount, t.frequency), 0),
    [activeExpenses]
  );
  const totalMonthlyIncome = useMemo(
    () => activeIncomes.reduce((sum, t) => sum + normalizeToMonthly(t.amount, t.frequency), 0),
    [activeIncomes]
  );
  const netMonthlyRecurring = totalMonthlyIncome - totalMonthlyOutflow;
  const comingUpCount = useMemo(() => {
    const cutoff = Date.now() + COMING_UP_DAYS * 24 * 60 * 60 * 1000;
    return transactions.filter(
      (t) => t.status === "active" && new Date(t.nextOccurrence).getTime() <= cutoff
    ).length;
  }, [transactions]);

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (typeFilter !== "all") result = result.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [transactions, typeFilter, statusFilter, searchQuery]);

  const sortedTransactions = useMemo(() => {
    const result = [...filteredTransactions];
    result.sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      if (sort.field === "amount") return (a.amount - b.amount) * dir;
      if (sort.field === "nextOccurrence") {
        return (new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime()) * dir;
      }
      const aVal = String(a[sort.field as keyof RecurringTransaction] ?? "");
      const bVal = String(b[sort.field as keyof RecurringTransaction] ?? "");
      return aVal.localeCompare(bVal) * dir;
    });
    return result;
  }, [filteredTransactions, sort]);

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const visibleIds = sortedTransactions.map((t) => t.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleIds));
  }, [sortedTransactions, selectedIds]);

  const handleBulkAction = useCallback(
    async (action: BulkAction) => {
      const ids = Array.from(selectedIds);
      try {
        await bulkAction(ids, action);
        const msg =
          action === "pause"
            ? TOAST_MESSAGES.bulkPaused(ids.length)
            : action === "resume"
              ? TOAST_MESSAGES.bulkResumed(ids.length)
              : TOAST_MESSAGES.bulkDeleted(ids.length);
        showToast("success", msg);
        setSelectedIds(new Set());
      } catch {
        showToast("error", "Bulk action failed. Please try again.");
      }
    },
    [selectedIds, bulkAction, showToast]
  );

  // Sort handler
  const handleSortChange = useCallback(
    (field: SortField) => {
      setSort((prev) => ({
        field,
        direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
      track("cash_flow_filter_changed", {
        franchise_id: activeFranchiseId,
        filter_type: "sort",
        filter_value: field,
      });
    },
    [activeFranchiseId]
  );

  // CRUD handlers
  const handleCreate = useCallback(
    async (data: CreateTransactionRequest | UpdateTransactionRequest) => {
      try {
        await createTransaction(data as CreateTransactionRequest);
        showToast("success", TOAST_MESSAGES.transactionCreated);
        setFormOpen(false);
        track("cash_flow_transaction_created", {
          franchise_id: activeFranchiseId,
          category: (data as CreateTransactionRequest).category,
          frequency: (data as CreateTransactionRequest).frequency,
        });
      } catch {
        showToast("error", TOAST_MESSAGES.transactionCrudError("add"));
      }
    },
    [createTransaction, showToast, activeFranchiseId]
  );

  const handleUpdate = useCallback(
    async (data: CreateTransactionRequest | UpdateTransactionRequest) => {
      if (!editingTransaction) return;
      try {
        await updateTransaction(editingTransaction.id, data);
        showToast("success", TOAST_MESSAGES.transactionUpdated);
        setEditingTransaction(undefined);
        setFormOpen(false);
        track("cash_flow_transaction_updated", {
          franchise_id: activeFranchiseId,
          transaction_id: editingTransaction.id,
        });
      } catch {
        showToast("error", TOAST_MESSAGES.transactionCrudError("update"));
      }
    },
    [editingTransaction, updateTransaction, showToast, activeFranchiseId]
  );

  const handleTogglePause = useCallback(
    async (txn: RecurringTransaction) => {
      const newStatus = txn.status === "active" ? "paused" : "active";
      try {
        await updateTransaction(txn.id, { status: newStatus });
        showToast("success", newStatus === "paused" ? "Transaction paused" : "Transaction resumed");
      } catch {
        showToast("error", `Unable to ${newStatus === "paused" ? "pause" : "resume"} transaction.`);
      }
    },
    [updateTransaction, showToast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id);
      showToast("success", TOAST_MESSAGES.transactionDeleted);
      track("cash_flow_transaction_deleted", {
        franchise_id: activeFranchiseId,
        transaction_id: deleteTarget.id,
      });
    } catch {
      showToast("error", TOAST_MESSAGES.transactionCrudError("delete"));
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteTransaction, showToast, activeFranchiseId]);

  const typeFilterOptions: { value: TypeFilter; label: string; count?: number }[] = [
    { value: "all", label: "All" },
    { value: "income", label: "Income", count: meta.incomeCount },
    { value: "expense", label: "Expense", count: meta.expenseCount },
  ];

  const statusFilterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
  ];

  return (
    <div className="py-8">
      {/* Page Header */}
      <div
        className="mb-5 flex items-start justify-between"
        style={{ animation: "fadeUp 0.4s ease forwards 0.05s", opacity: 0 }}
      >
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#1a1a1a]">
            Recurring Transactions
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-[#6b7280]">
            {isFom && franchises.length > 0 ? (
              <select
                value={activeFranchiseId}
                onChange={(e) => setSelectedFranchise(e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                aria-label="Select franchise"
              >
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            ) : (
              "Fixed costs and income that repeat on a schedule"
            )}
          </p>
        </div>

        <RoleGate allowedRoles={["franchise_partner"]} userRole={userRole}>
          <button
            onClick={() => {
              setEditingTransaction(undefined);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-[9px] bg-[#8BC34A] px-[18px] py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#6a9e32]"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M8 2v12M2 8h12" />
            </svg>
            Add Transaction
          </button>
        </RoleGate>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonCard lines={8} />}

      {/* Error */}
      {error && !transactions.length && (
        <div className="rounded-lg border border-danger-100 bg-danger-50 p-6 text-center">
          <p className="text-sm text-danger-600">
            Unable to load transactions. Check your connection and try again.
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {transactions.length === 0 ? (
            <EmptyState
              title={EMPTY_STATE_MESSAGES.recurring.title}
              description={EMPTY_STATE_MESSAGES.recurring.description}
              actionLabel={isFom ? undefined : "Add Transaction"}
              onAction={
                isFom
                  ? undefined
                  : () => {
                      setEditingTransaction(undefined);
                      setFormOpen(true);
                    }
              }
            />
          ) : (
            <>
              {/* Summary Strip */}
              <div
                className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
                style={{ animation: "fadeUp 0.4s ease forwards 0.1s", opacity: 0 }}
              >
                <SummaryCard
                  label="Total Monthly Outflow"
                  value={`−${formatCurrency(totalMonthlyOutflow)}`}
                  valueColor="text-[#ef4444]"
                  sub={`${activeExpenses.length} active expense${activeExpenses.length !== 1 ? "s" : ""}`}
                />
                <SummaryCard
                  label="Total Monthly Income"
                  value={`+${formatCurrency(totalMonthlyIncome)}`}
                  valueColor="text-[#6a9e32]"
                  sub={`${activeIncomes.length} active income`}
                />
                <SummaryCard
                  label="Net Monthly Recurring"
                  value={
                    netMonthlyRecurring >= 0
                      ? `+${formatCurrency(netMonthlyRecurring)}`
                      : `−${formatCurrency(Math.abs(netMonthlyRecurring))}`
                  }
                  valueColor={netMonthlyRecurring >= 0 ? "text-[#6a9e32]" : "text-[#ef4444]"}
                  sub="Expenses minus income"
                />
                <SummaryCard
                  label="Coming Up"
                  value={String(comingUpCount)}
                  valueColor="text-[#f59e0b]"
                  sub="Due in next 7 days"
                />
              </div>

              {/* Table Card */}
              <div
                className="overflow-hidden rounded-[14px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]"
                style={{ animation: "fadeUp 0.4s ease forwards 0.15s", opacity: 0 }}
              >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f4f3f1] px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-5">
                    {/* Type Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="mr-0.5 text-xs font-semibold text-[#6b7280]">Type:</span>
                      {typeFilterOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTypeFilter(opt.value)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                            typeFilter === opt.value
                              ? "border-[#8BC34A] bg-[#8BC34A] text-white"
                              : "border-[#e5e7eb] text-[#6b7280] hover:border-[#c5e49a] hover:bg-[#f1f8e9] hover:text-[#3d6b14]"
                          )}
                        >
                          {opt.label}
                          {opt.count !== undefined && (
                            <span className="ml-0.5 text-[10px] opacity-80">({opt.count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="mr-0.5 text-xs font-semibold text-[#6b7280]">Status:</span>
                      {statusFilterOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setStatusFilter(opt.value)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                            statusFilter === opt.value
                              ? "border-[#8BC34A] bg-[#8BC34A] text-white"
                              : "border-[#e5e7eb] text-[#6b7280] hover:border-[#c5e49a] hover:bg-[#f1f8e9] hover:text-[#3d6b14]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Search */}
                  <div className="flex items-center gap-2 rounded-[9px] border border-[#e5e7eb] bg-[#f4f3f1] px-3 py-[7px] transition-all focus-within:border-[#8BC34A] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(139,195,74,0.1)]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="h-3.5 w-3.5 flex-shrink-0 text-[#6b7280]"
                    >
                      <circle cx="6.5" cy="6.5" r="4" />
                      <path d="M10.5 10.5l3 3" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search transactions…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 border-none bg-transparent text-xs font-medium text-[#1a1a1a] outline-none placeholder:text-[#6b7280]"
                    />
                  </div>
                </div>

                {/* Table */}
                <TransactionTable
                  transactions={sortedTransactions}
                  sort={sort}
                  onSortChange={handleSortChange}
                  onEdit={(txn) => {
                    setEditingTransaction(txn);
                    setFormOpen(true);
                  }}
                  onDelete={setDeleteTarget}
                  onTogglePause={handleTogglePause}
                  userRole={userRole}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                />

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#f4f3f1] bg-[#f4f3f1] px-5 py-3">
                  <div className="text-xs font-medium text-[#6b7280]">
                    Showing <strong className="text-[#1a1a1a]">{sortedTransactions.length}</strong>{" "}
                    of <strong className="text-[#1a1a1a]">{meta.total}</strong> transactions
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#6b7280]">
                        {selectedIds.size} selected
                      </span>
                      <button
                        onClick={() => handleBulkAction("pause")}
                        className="flex items-center gap-1 rounded-[7px] border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b7280] transition-all hover:border-[#c5e49a] hover:text-[#3d6b14]"
                      >
                        ⏸ Pause selected
                      </button>
                      <button
                        onClick={() => handleBulkAction("delete")}
                        className="flex items-center gap-1 rounded-[7px] border border-[#fecaca] bg-white px-3 py-1.5 text-xs font-semibold text-[#ef4444] transition-all hover:bg-[#fef2f2]"
                      >
                        🗑 Delete selected
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Add/Edit Form Modal */}
      {formOpen && (
        <Suspense fallback={null}>
          <TransactionForm
            open={formOpen}
            transaction={editingTransaction}
            onSubmit={editingTransaction ? handleUpdate : handleCreate}
            onClose={() => {
              setFormOpen(false);
              setEditingTransaction(undefined);
            }}
          />
        </Suspense>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={CONFIRM_MESSAGES.deleteTransaction(deleteTarget?.name ?? "").title}
        description={CONFIRM_MESSAGES.deleteTransaction(deleteTarget?.name ?? "").description}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
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
      <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#6b7280]">
        {label}
      </div>
      <div className={cn("font-mono tabular-nums text-xl font-medium leading-none tracking-[-0.02em]", valueColor)}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-[#6b7280]">{sub}</div>
    </div>
  );
}

export function RecurringTransactionsShell(props: RecurringTransactionsShellProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 py-8">
          <SkeletonCard lines={8} />
        </div>
      }
    >
      <RecurringTransactionsInner {...props} />
    </Suspense>
  );
}
