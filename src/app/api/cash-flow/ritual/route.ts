import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel, camelToRow } from "@/lib/supabase";
import type {
  CompleteRitualRequest,
  CompleteRitualResponse,
  WeeklySnapshot,
  HealthStatus,
  RitualWelcomeData,
} from "@/types/cash-flow";
import { DEFAULT_BUFFER } from "@/constants/cash-flow";

// ============================================
// GET — Fetch welcome data for the ritual
// ============================================

export async function GET(request: NextRequest) {
  const franchise = request.nextUrl.searchParams.get("franchise");

  if (!franchise) {
    return apiError("franchise query param is required", 400);
  }

  if (isMockMode()) {
    return apiSuccess<RitualWelcomeData>({
      suggestedBalance: 93500,
      lastRitualDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      currentCashPosition: 93500,
      previousCashPosition: 85300,
      recurringExpenseChanges: 2,
      oneOffExpensesFlagged: 3,
      minBalanceThreshold: DEFAULT_BUFFER,
    });
  }

  // Fetch the two most recent snapshots
  const { data: snapRows, error: snapError } = await supabase
    .from("weekly_snapshots")
    .select("*")
    .eq("franchise_id", franchise)
    .order("completed_at", { ascending: false })
    .limit(2);

  if (snapError) return apiError(snapError.message, 500);

  // Fetch franchise threshold setting
  const { data: settingsRow } = await supabase
    .from("franchise_settings")
    .select("min_balance")
    .eq("franchise_id", franchise)
    .maybeSingle();

  const minBalanceThreshold = settingsRow?.min_balance ?? DEFAULT_BUFFER;

  const latest = snapRows?.[0] ? rowToCamel<WeeklySnapshot>(snapRows[0]) : null;
  const previous = snapRows?.[1] ? rowToCamel<WeeklySnapshot>(snapRows[1]) : null;

  return apiSuccess<RitualWelcomeData>({
    suggestedBalance: latest?.endingBalance ?? latest?.bankBalance ?? null,
    lastRitualDate: latest?.completedAt ?? null,
    currentCashPosition: latest?.bankBalance ?? null,
    previousCashPosition: previous?.bankBalance ?? null,
    recurringExpenseChanges: 0,
    oneOffExpensesFlagged: 0,
    minBalanceThreshold,
  });
}

// ============================================
// POST — Complete the weekly ritual
// ============================================

export async function POST(request: NextRequest) {
  let body: CompleteRitualRequest;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { franchiseId, completedBy = "usr_001" } = body;

  if (!franchiseId) {
    return apiError("franchiseId is required", 400);
  }

  // Server-side computations
  const totalRecurring = body.recurringExpenses
    .filter((e) => e.checked)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOneOff = body.oneOffExpenses.reduce((sum, e) => sum + e.amount, 0);

  const arGross = body.arItems.reduce((sum, i) => sum + i.amount, 0);
  const arRealized = Math.round(arGross * (body.arCollectionRate / 100));

  const salesGross = body.salesItems.reduce((sum, i) => sum + i.amount, 0);
  const salesLikely = Math.round(salesGross * ((100 - body.salesCancellationRate) / 100));

  const proposalsGross = body.proposalItems.reduce((sum, i) => sum + i.amount, 0);
  const proposalsExpected = Math.round(proposalsGross * (body.proposalsCloseRate / 100));

  const totalProjectedRevenue = body.bankBalance + arRealized + salesLikely + proposalsExpected;
  const projectedBalance = totalProjectedRevenue - totalRecurring - totalOneOff;

  // Fetch franchise threshold for health status
  const { data: postSettingsRow } = await supabase
    .from("franchise_settings")
    .select("min_balance")
    .eq("franchise_id", franchiseId)
    .maybeSingle();

  const minBalance = postSettingsRow?.min_balance ?? DEFAULT_BUFFER;

  const healthStatus: HealthStatus =
    projectedBalance >= minBalance * 2
      ? "healthy"
      : projectedBalance >= minBalance
        ? "caution"
        : "critical";

  if (isMockMode()) {
    const mockSnapshot: WeeklySnapshot = {
      id: `snap_${Date.now()}`,
      franchiseId: body.franchiseId,
      bankBalance: body.bankBalance,
      tcp: projectedBalance,
      netWeeklyCashFlow: totalProjectedRevenue - totalRecurring - totalOneOff,
      weeksOfRunway: null,
      healthStatus,
      completedAt: new Date().toISOString(),
      completedBy: body.completedBy,
      openingBalance: body.bankBalance,
      totalCollections: arRealized + salesLikely + proposalsExpected,
      totalVariableCogs: 0,
      totalFixedCosts: totalRecurring,
      totalOneTimeCosts: totalOneOff,
      endingBalance: projectedBalance,
      weekStart: body.weekStart,
      weekEnd: body.weekEnd,
    };

    return apiSuccess<CompleteRitualResponse>({
      snapshot: mockSnapshot,
      message: "Ritual completed successfully",
    });
  }

  // ── Real (Supabase) path ──

  // 1. Insert bank balance record
  const { error: balError } = await supabase
    .from("bank_balances")
    .insert(
      camelToRow({
        franchiseId,
        amount: body.bankBalance,
        recordedAt: new Date().toISOString(),
        recordedBy: completedBy,
      })
    );

  if (balError) return apiError(balError.message, 500);

  // 2. Insert weekly snapshot
  const snapshotRow = camelToRow({
    franchiseId,
    bankBalance: body.bankBalance,
    tcp: projectedBalance,
    netWeeklyCashFlow: totalProjectedRevenue - totalRecurring - totalOneOff,
    weeksOfRunway: null,
    healthStatus,
    completedAt: new Date().toISOString(),
    completedBy,
    openingBalance: body.bankBalance,
    totalCollections: arRealized + salesLikely + proposalsExpected,
    totalVariableCogs: 0,
    totalFixedCosts: totalRecurring,
    totalOneTimeCosts: totalOneOff,
    endingBalance: projectedBalance,
    weekStart: body.weekStart,
    weekEnd: body.weekEnd,
  });

  const { data: snapData, error: snapError } = await supabase
    .from("weekly_snapshots")
    .insert(snapshotRow)
    .select()
    .single();

  if (snapError) return apiError(snapError.message, 500);

  const snapshot = rowToCamel<WeeklySnapshot>(snapData);

  // 3. Promote one-off expenses to recurring if flagged
  const toPromote = body.oneOffExpenses.filter((e) => e.makeRecurring);
  if (toPromote.length > 0) {
    const recurringRows = toPromote.map((e) =>
      camelToRow({
        franchiseId,
        name: e.description,
        type: "expense",
        amount: e.amount,
        frequency: "monthly",
        startDate: body.weekStart,
        nextOccurrence: body.weekStart,
        status: "active",
        category: "other",
      })
    );

    await supabase.from("recurring_transactions").insert(recurringRows);
  }

  // 4. Persist individual revenue items
  const ritualDate = body.weekStart;
  const weekStartDate = new Date(body.weekStart + "T00:00:00");
  const weekOffset = (w: string) => {
    const num = parseInt(w.replace("w", ""));
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + num * 7);
    return d.toISOString().split("T")[0];
  };

  const revenueRows = [
    ...body.arItems.map((item) => ({
      franchise_id: franchiseId,
      note: item.note,
      category: "ar",
      gross_amount: item.amount,
      adjusted_amount: Math.round(item.amount * (body.arCollectionRate / 100)),
      adjustment_rate: body.arCollectionRate,
      week: item.week,
      expected_date: weekOffset(item.week),
      status: "open",
      ritual_date: ritualDate,
      snapshot_id: snapshot.id,
    })),
    ...body.salesItems.map((item) => ({
      franchise_id: franchiseId,
      note: item.note,
      category: "sales",
      gross_amount: item.amount,
      adjusted_amount: Math.round(item.amount * ((100 - body.salesCancellationRate) / 100)),
      adjustment_rate: 100 - body.salesCancellationRate,
      week: item.week,
      expected_date: weekOffset(item.week),
      status: "open",
      ritual_date: ritualDate,
      snapshot_id: snapshot.id,
    })),
    ...body.proposalItems.map((item) => ({
      franchise_id: franchiseId,
      note: item.note,
      category: "proposal",
      gross_amount: item.amount,
      adjusted_amount: Math.round(item.amount * (body.proposalsCloseRate / 100)),
      adjustment_rate: body.proposalsCloseRate,
      week: item.week,
      expected_date: weekOffset(item.week),
      status: "open",
      ritual_date: ritualDate,
      snapshot_id: snapshot.id,
    })),
  ];

  if (revenueRows.length > 0) {
    await supabase.from("revenue_items").insert(revenueRows);
  }

  return apiSuccess<CompleteRitualResponse>({
    snapshot,
    message: "Ritual completed successfully",
  });
}
