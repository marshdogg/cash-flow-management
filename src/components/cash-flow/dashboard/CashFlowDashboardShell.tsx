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
import { daysUntilNextRitual } from "@/lib/date-utils";
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
      assignedFranchises.length > 0
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
    franchises.length > 1
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

  // Prefer ritual-stored bank balance (survives navigation) over API opening balance
  const effectiveOpeningBalance = useMemo(() => {
    try {
      const stored = localStorage.getItem(`ritualBankBalance_${activeFranchiseId}`);
      if (stored != null) return parseInt(stored) || 0;
    } catch {}
    return data?.openingBalance ?? 0;
  }, [activeFranchiseId, data?.openingBalance]);

  const { totalRevenue, totalExpense, projectedBalance } = useMemo(() => {
    const rev = displayPeriods.reduce((s, p) => s + p.revenue, 0);
    const exp = displayPeriods.reduce((s, p) => s + p.expense, 0);
    return {
      totalRevenue: rev,
      totalExpense: exp,
      projectedBalance: effectiveOpeningBalance + rev - exp,
    };
  }, [displayPeriods, effectiveOpeningBalance]);

  if (isLoading) {
    return (
      <div>
        <SkeletonCard lines={12} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-danger-100 bg-danger-50 p-6 text-center">
        <p className="text-sm text-danger-600">
          Unable to load dashboard. Check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-[32px_40px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Card Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#1a1a1a]">Cash Flow</h2>
          {franchises.length > 1 ? (
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
            <p className="mt-0.5 text-[13px] font-medium text-[#6b7280]">{displayName}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle */}
          <div className="flex gap-0.5 rounded-lg bg-[#f3f4f6] p-[3px]">
            <button
              onClick={() => setView("weeks")}
              className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                view === "weeks"
                  ? "bg-white text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#6b7280]"
              }`}
            >
              12 Weeks
            </button>
            <button
              onClick={() => setView("months")}
              className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                view === "months"
                  ? "bg-white text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#6b7280]"
              }`}
            >
              3 Months
            </button>
          </div>

          {/* Edit This Week */}
          <Link
            href={`${CASH_FLOW_ROUTES.ritual}?franchise=${activeFranchiseId}`}
            className="rounded-[9px] bg-[#8BC34A] px-[18px] py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#6a9e32]"
          >
            Edit This Week
          </Link>
        </div>
      </div>

      {/* Ritual Countdown Badge */}
      {(() => {
        // Use the more recent of API date vs locally-stored completion date
        const apiDate = data?.lastRitualDate ?? null;
        let storedDate: string | null = null;
        try { storedDate = localStorage.getItem(`lastRitualDate_${activeFranchiseId}`); } catch {}
        const effectiveDate = apiDate && storedDate
          ? (apiDate > storedDate ? apiDate : storedDate)
          : storedDate ?? apiDate;
        if (!effectiveDate) return null;
        const daysLeft = daysUntilNextRitual(effectiveDate);
        if (daysLeft === null) return null;
        const isOverdue = daysLeft <= 0;
        return (
          <div
            className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-[13px] font-semibold ${
              isOverdue
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#c5e49a] bg-[#f1f8e9] text-[#3d6b14]"
            }`}
          >
            <span>
              {isOverdue
                ? `Ritual overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""}`
                : `Next ritual due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
            </span>
            <Link
              href={`${CASH_FLOW_ROUTES.ritual}?franchise=${activeFranchiseId}`}
              className={`text-[12px] font-bold underline ${
                isOverdue ? "text-red-700" : "text-[#3d6b14]"
              }`}
            >
              Start Ritual
            </Link>
          </div>
        );
      })()}

      {displayPeriods.length > 0 ? (
        <>
          {/* Metric + Threshold row */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#6b7280]">
                {view === "weeks" ? "12-Week" : "3-Month"} Projected Balance
              </div>
              <div
                className={`mt-1 font-mono tabular-nums text-[32px] font-bold leading-none tracking-[-0.02em] ${
                  projectedBalance >= threshold
                    ? "text-[#16a34a]"
                    : "text-[#dc2626]"
                }`}
              >
                {formatCurrency(projectedBalance)}
              </div>
              <div className="mt-1.5 text-[12px] font-medium text-[#6b7280]">
                {projectedBalance >= threshold
                  ? "Above minimum"
                  : "⚠ Below minimum threshold"}
              </div>
            </div>

            {/* Threshold control */}
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-semibold text-[#6b7280]">Min Balance</span>
              <div className="flex overflow-hidden rounded-lg border border-[#e5e7eb]">
                <div className="border-r border-[#e5e7eb] bg-[#f9fafb] px-2 py-[5px] font-mono text-[13px] font-semibold text-[#374151]">
                  $
                </div>
                <input
                  type="text"
                  value={threshold.toLocaleString()}
                  onChange={handleThresholdInput}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveThreshold(); }}
                  aria-label="Minimum balance threshold"
                  className="w-[90px] bg-white px-2.5 py-[5px] font-mono text-[13px] font-semibold text-[#1a1a1a] outline-none"
                />
              </div>
              {isDirty && (
                <button
                  type="button"
                  onClick={handleSaveThreshold}
                  className="rounded-lg bg-[#8BC34A] px-2.5 py-[5px] text-[12px] font-semibold text-white transition-colors hover:bg-[#7ab33e]"
                >
                  Set
                </button>
              )}
            </div>
          </div>

          {/* Chart */}
          <Suspense fallback={<div className="h-[320px]" />}>
            <CashFlowChart
              periods={displayPeriods}
              openingBalance={effectiveOpeningBalance}
              threshold={threshold}
            />
          </Suspense>

          {/* Legend — below chart */}
          <div className="mt-3 flex items-center justify-center gap-5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
              <div className="h-2.5 w-2.5 rounded-[2px] bg-[#3b82f6]" />
              Actual
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
              <div className="h-2.5 w-2.5 rounded-[2px] bg-[#3b82f6] opacity-35" />
              Projected
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
              <div className="h-2.5 w-2.5 rounded-[2px] bg-[#ef4444]" />
              Below Min
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
              <div className="flex gap-0.5">
                <div className="h-0.5 w-1.5 rounded-sm bg-[#f97316]" />
                <div className="h-0.5 w-1.5 rounded-sm bg-[#f97316]" />
                <div className="h-0.5 w-1.5 rounded-sm bg-[#f97316]" />
              </div>
              Min Balance
            </div>
          </div>
        </>
      ) : (
        /* First-Use Getting Started */
        <div className="py-6">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1f8e9] text-3xl">
              📊
            </div>
            <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#1a1a1a]">
              Welcome to your Cash Flow Guide
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[14px] font-medium leading-relaxed text-[#6b7280]">
              See where your cash stands today and where it&apos;s headed over the next 12 weeks. Start by completing your first weekly ritual.
            </p>
          </div>

          {/* How it works — 3 steps */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#e5e7eb] bg-[#fafaf8] px-5 py-5 text-center">
              <div className="mb-2.5 text-2xl">📋</div>
              <div className="text-[13px] font-bold text-[#1a1a1a]">1. Complete your ritual</div>
              <p className="mt-1 text-[12px] font-medium leading-snug text-[#6b7280]">
                Enter your bank balance, review expenses, and log expected revenue
              </p>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-[#fafaf8] px-5 py-5 text-center">
              <div className="mb-2.5 text-2xl">📈</div>
              <div className="text-[13px] font-bold text-[#1a1a1a]">2. See your projection</div>
              <p className="mt-1 text-[12px] font-medium leading-snug text-[#6b7280]">
                Your 12-week cash flow chart appears here with projected balances
              </p>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-[#fafaf8] px-5 py-5 text-center">
              <div className="mb-2.5 text-2xl">🔄</div>
              <div className="text-[13px] font-bold text-[#1a1a1a]">3. Stay on top of it</div>
              <p className="mt-1 text-[12px] font-medium leading-snug text-[#6b7280]">
                Update weekly to keep your projections accurate and avoid surprises
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`${CASH_FLOW_ROUTES.ritual}?franchise=${activeFranchiseId}`}
              className="inline-flex items-center gap-2.5 rounded-[9px] bg-[#8BC34A] px-7 py-3 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#6a9e32]"
            >
              Start your first ritual
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <p className="mt-3 text-[12px] font-medium text-[#6b7280]">
              Takes about 5 minutes
            </p>
          </div>
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
        <div>
          <SkeletonCard lines={12} />
        </div>
      }
    >
      <CashFlowDashboardInner {...props} />
    </Suspense>
  );
}
