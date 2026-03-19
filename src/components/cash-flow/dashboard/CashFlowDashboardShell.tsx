"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef, lazy } from "react";
import Link from "next/link";
import { useCashFlowDashboard } from "@/hooks/useCashFlowDashboard";
import { useFranchisePicker } from "@/hooks/useFranchisePicker";
import { SkeletonCard } from "@/components/cash-flow/shared/SkeletonCard";

const CashFlowChart = lazy(() =>
  import("./CashFlowChart").then((m) => ({ default: m.CashFlowChart }))
);
import { updateSettings } from "@/lib/cash-flow/cash-flow-api";
import { CASH_FLOW_ROUTES } from "@/constants/cash-flow";
import { formatCurrency } from "@/lib/cash-flow/format-utils";
import type { CashFlowUserRole, AssignedFranchise } from "@/types/cash-flow";

interface CashFlowDashboardShellProps {
  franchiseId: string;
  franchiseName: string;
  userRole: CashFlowUserRole;
  assignedFranchises?: AssignedFranchise[];
}

type ViewMode = "weeks" | "months";

function CashFlowDashboardInner({
  franchiseId: defaultFranchiseId,
  franchiseName,
  userRole,
  assignedFranchises = [],
}: CashFlowDashboardShellProps) {
  const isFom = userRole === "fom";
  const { selectedFranchise, setSelectedFranchise, franchises } =
    useFranchisePicker(
      isFom
        ? assignedFranchises
        : [{ id: defaultFranchiseId, name: franchiseName }]
    );
  const activeFranchiseId = selectedFranchise?.id ?? defaultFranchiseId;

  const { data, error, isLoading } = useCashFlowDashboard(activeFranchiseId);

  const [view, setView] = useState<ViewMode>("weeks");

  // Read threshold from localStorage (survives navigation), fallback to server, then default
  const getStoredThreshold = (fid: string): number | null => {
    try {
      const v = localStorage.getItem(`minBalance_${fid}`);
      return v ? parseInt(v) || null : null;
    } catch { return null; }
  };

  const [threshold, setThreshold] = useState<number>(
    () => getStoredThreshold(activeFranchiseId) ?? data?.threshold ?? 5000
  );

  // Sync threshold only when franchise changes (FOM picker), not on every SWR refetch
  const prevFranchiseRef = useRef(activeFranchiseId);
  useEffect(() => {
    if (activeFranchiseId !== prevFranchiseRef.current) {
      prevFranchiseRef.current = activeFranchiseId;
      setThreshold(getStoredThreshold(activeFranchiseId) ?? data?.threshold ?? 5000);
    }
  }, [activeFranchiseId, data?.threshold]);

  // Track the last saved value so we know when the input is dirty
  const [savedThreshold, setSavedThreshold] = useState(threshold);
  const isDirty = threshold !== savedThreshold && threshold > 0;

  const handleThresholdInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setThreshold(parseInt(raw) || 0);
    },
    []
  );

  const handleSaveThreshold = useCallback(() => {
    if (threshold <= 0) return;
    try { localStorage.setItem(`minBalance_${activeFranchiseId}`, String(threshold)); } catch {}
    setSavedThreshold(threshold);
    updateSettings(activeFranchiseId, threshold).catch(() => {});
  }, [threshold, activeFranchiseId]);

  const displayName =
    isFom && franchises.length > 0
      ? franchises.find((f) => f.id === activeFranchiseId)?.name ?? franchiseName
      : data?.franchiseName || franchiseName;

  // Aggregate periods to 3 months if in months view
  const periods = data?.periods ?? [];
  const displayPeriods = useMemo(
    () =>
      view === "months" && periods.length >= 12
        ? [
            {
              label: "Mar",
              ...aggregateSlice(periods, 0, 4),
              current: true,
            },
            {
              label: "Apr",
              ...aggregateSlice(periods, 4, 8),
            },
            {
              label: "May",
              ...aggregateSlice(periods, 8, 12),
            },
          ]
        : periods,
    [periods, view]
  );

  const { totalRevenue, totalExpense, projectedBalance } = useMemo(() => {
    const rev = displayPeriods.reduce((s, p) => s + p.revenue, 0);
    const exp = displayPeriods.reduce((s, p) => s + p.expense, 0);
    return {
      totalRevenue: rev,
      totalExpense: exp,
      projectedBalance: (data?.openingBalance ?? 0) + rev - exp,
    };
  }, [displayPeriods, data?.openingBalance]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <SkeletonCard lines={12} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-xl border border-danger-100 bg-danger-50 p-6 text-center">
        <p className="text-sm text-danger-600">
          Unable to load dashboard. Check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] rounded-xl bg-white p-[32px_40px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Card Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#111827]">Cash Flow</h2>
          {isFom && franchises.length > 0 ? (
            <select
              value={activeFranchiseId}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="mt-1 rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-[#6b7280] focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              aria-label="Select franchise"
            >
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-sm text-[#6b7280]">{displayName}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle */}
          <div className="flex gap-0.5 rounded-lg bg-[#f3f4f6] p-[3px]">
            <button
              onClick={() => setView("weeks")}
              className={`rounded-md px-4 py-[10px] text-sm font-semibold transition-all ${
                view === "weeks"
                  ? "bg-white text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : "text-[#6b7280]"
              }`}
            >
              12 Weeks
            </button>
            <button
              onClick={() => setView("months")}
              className={`rounded-md px-4 py-[10px] text-sm font-semibold transition-all ${
                view === "months"
                  ? "bg-white text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : "text-[#6b7280]"
              }`}
            >
              3 Months
            </button>
          </div>

          {/* Manage Recurring */}
          <Link
            href={CASH_FLOW_ROUTES.recurring}
            className="rounded-lg border-[1.5px] border-[#e5e7eb] bg-white px-[18px] py-[11px] text-sm font-semibold text-[#374151] min-h-[44px]"
          >
            ≡ Manage Recurring
          </Link>

          {/* Edit This Week */}
          <Link
            href={CASH_FLOW_ROUTES.ritual}
            className="rounded-lg bg-[#8BC34A] px-[18px] py-[11px] text-sm font-semibold text-white min-h-[44px]"
          >
            Edit This Week
          </Link>
        </div>
      </div>

      {/* Hero: Projected Balance */}
      <div className="mb-5 flex items-center justify-between border-b border-[#f3f4f6] pb-5">
        <div className="flex flex-col gap-1">
          <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#6b7280]">
            Projected Balance
          </div>
          <div
            className={`font-mono text-[36px] font-bold leading-tight tracking-[-0.02em] ${
              projectedBalance >= threshold
                ? "text-[#16a34a]"
                : "text-[#dc2626]"
            }`}
          >
            {formatCurrency(projectedBalance)}
          </div>
          <div className="text-[13px] font-medium text-[#6b7280]">
            {projectedBalance >= threshold
              ? "Above minimum"
              : "⚠ Below minimum threshold"}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-right">
          <div className="flex items-center justify-end gap-4">
            <span className="font-mono text-[16px] font-semibold text-[#16a34a]">
              +{formatCurrency(totalRevenue)} in
            </span>
            <span className="font-mono text-[16px] font-semibold text-[#dc2626]">
              -{formatCurrency(totalExpense)} out
            </span>
          </div>
          <div className="text-[13px] font-medium text-[#6b7280]">
            {view === "weeks" ? "Next 12 weeks" : "Next 3 months"}
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="mb-5 flex items-center justify-between">
        {/* Legend */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
            <div className="h-3 w-3 rounded-[3px] bg-[#3b82f6]" />
            Bank Balance
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
            <div className="h-3 w-3 rounded-[3px] bg-[#3b82f6] opacity-35" />
            Projected
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
            <div className="h-3 w-3 rounded-[3px] bg-[#ef4444]" />
            Below Minimum
          </div>
        </div>

        {/* Threshold */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#6b7280]">
            <div className="flex gap-0.5">
              <div className="h-0.5 w-2 rounded-sm bg-[#f97316]" />
              <div className="h-0.5 w-2 rounded-sm bg-[#f97316]" />
              <div className="h-0.5 w-2 rounded-sm bg-[#f97316]" />
            </div>
            Min Balance
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border-[1.5px] border-[#e5e7eb] bg-white">
              <div className="border-r-[1.5px] border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-[7px] font-mono text-[15px] font-semibold text-[#374151]">
                $
              </div>
              <input
                type="text"
                value={threshold.toLocaleString()}
                onChange={handleThresholdInput}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveThreshold(); }}
                aria-label="Minimum balance threshold"
                className="w-[110px] bg-white px-3 py-[7px] font-mono text-[15px] font-semibold text-[#111827] outline-none"
              />
            </div>
            {isDirty && (
              <button
                type="button"
                onClick={handleSaveThreshold}
                className="rounded-lg bg-[#8BC34A] px-3 py-[7px] text-[13px] font-semibold text-white transition-all hover:bg-[#7ab33e] active:scale-95"
              >
                Set
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {displayPeriods.length > 0 ? (
        <Suspense fallback={<div className="h-[420px]" />}>
          <CashFlowChart
            periods={displayPeriods}
            openingBalance={data?.openingBalance ?? 0}
            threshold={threshold}
          />
        </Suspense>
      ) : (
        <div className="flex h-[420px] items-center justify-center text-base text-[#6b7280]">
          Complete your first weekly ritual to see chart data.
        </div>
      )}

    </div>
  );
}

function aggregateSlice(
  periods: { bank: number; ar: number; sales: number; proposals: number; revenue: number; expense: number }[],
  start: number,
  end: number
) {
  const slice = periods.slice(start, end);
  return {
    bank: slice.reduce((s, p) => s + p.bank, 0),
    ar: slice.reduce((s, p) => s + p.ar, 0),
    sales: slice.reduce((s, p) => s + p.sales, 0),
    proposals: slice.reduce((s, p) => s + p.proposals, 0),
    revenue: slice.reduce((s, p) => s + p.revenue, 0),
    expense: slice.reduce((s, p) => s + p.expense, 0),
  };
}

export function CashFlowDashboardShell(props: CashFlowDashboardShellProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px]">
          <SkeletonCard lines={12} />
        </div>
      }
    >
      <CashFlowDashboardInner {...props} />
    </Suspense>
  );
}
