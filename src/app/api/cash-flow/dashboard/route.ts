import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel } from "@/lib/supabase";
import type { CashFlowDashboardResponse, ChartPeriod } from "@/types/cash-flow";
import { DEFAULT_BUFFER } from "@/constants/cash-flow";

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("franchise parameter is required", 400);
  }

  if (isMockMode()) {
    const { mockDashboardResponse } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    return apiSuccess<CashFlowDashboardResponse>(mockDashboardResponse, {
      franchiseId,
    });
  }

  // Fetch last 12 weekly snapshots
  const { data: snapRows, error: snapError } = await supabase
    .from("weekly_snapshots")
    .select("*")
    .eq("franchise_id", franchiseId)
    .order("completed_at", { ascending: true })
    .limit(12);

  if (snapError) return apiError(snapError.message, 500);

  // Fetch latest bank balance for opening
  const { data: balRow } = await supabase
    .from("bank_balances")
    .select("amount")
    .eq("franchise_id", franchiseId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();

  const openingBalance = balRow?.amount ?? 0;

  // Fetch franchise threshold setting
  const { data: settingsRow } = await supabase
    .from("franchise_settings")
    .select("min_balance")
    .eq("franchise_id", franchiseId)
    .maybeSingle();

  const threshold = settingsRow?.min_balance ?? DEFAULT_BUFFER;

  const snapshots = (snapRows ?? []).map((r) => rowToCamel<Record<string, number | string>>(r));

  // Build periods from snapshots
  const periods: ChartPeriod[] = snapshots.map((s, i) => {
    const totalCollections = Number(s.totalCollections) || 0;
    const workCompleted = Number(s.workCompleted) || 0;
    const cashCollections = Number(s.cashChequeCollections) || 0;
    const ccCollections = Number(s.creditCardCollections) || 0;
    const revenue = totalCollections || workCompleted;

    const bank = cashCollections || revenue * 0.33;
    const ar = ccCollections * 0.3 || revenue * 0.2;
    const sales = ccCollections * 0.5 || revenue * 0.3;
    const proposals = revenue - bank - ar - sales;

    const totalCogs = Number(s.totalVariableCogs) || 0;
    const fixedCosts = Number(s.totalFixedCosts) || 0;
    const oneTimeCosts = Number(s.totalOneTimeCosts) || 0;
    const expense = totalCogs + fixedCosts + oneTimeCosts;

    return {
      label: `Wk ${i + 1}`,
      bank: Math.round(bank),
      ar: Math.round(ar),
      sales: Math.round(sales),
      proposals: Math.round(Math.max(0, proposals)),
      revenue: Math.round(revenue),
      expense: Math.round(expense),
      current: i === 0,
    };
  });

  // Pad to 12 with projections based on averages
  if (periods.length > 0 && periods.length < 12) {
    const avg = (key: keyof ChartPeriod) =>
      periods.reduce((s, p) => s + (Number(p[key]) || 0), 0) / periods.length;

    for (let i = periods.length; i < 12; i++) {
      periods.push({
        label: `Wk ${i + 1}`,
        bank: Math.round(avg("bank")),
        ar: Math.round(avg("ar")),
        sales: Math.round(avg("sales")),
        proposals: Math.round(avg("proposals")),
        revenue: Math.round(avg("revenue")),
        expense: Math.round(avg("expense")),
      });
    }
  }

  if (periods.length === 0) {
    return apiSuccess<CashFlowDashboardResponse>(
      {
        franchiseName: "",
        openingBalance: 0,
        periods: [],
        threshold,
        summary: { totalRevenue: 0, totalExpense: 0, projectedBalance: 0 },
      },
      { franchiseId }
    );
  }

  const totalRevenue = periods.reduce((s, p) => s + p.revenue, 0);
  const totalExpense = periods.reduce((s, p) => s + p.expense, 0);

  return apiSuccess<CashFlowDashboardResponse>(
    {
      franchiseName: "",
      openingBalance,
      periods,
      threshold: DEFAULT_BUFFER,
      summary: {
        totalRevenue,
        totalExpense,
        projectedBalance: openingBalance + totalRevenue - totalExpense,
      },
    },
    { franchiseId }
  );
}
