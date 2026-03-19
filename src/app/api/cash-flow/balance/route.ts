import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel } from "@/lib/supabase";
import type { CashFlowBalanceResponse, BankBalance } from "@/types/cash-flow";

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("franchise parameter is required", 400);
  }

  if (isMockMode()) {
    const { mockBalanceResponse } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    return apiSuccess<CashFlowBalanceResponse>(mockBalanceResponse, {
      franchiseId,
    });
  }

  const { data: rows, error } = await supabase
    .from("bank_balances")
    .select("*")
    .eq("franchise_id", franchiseId)
    .order("recorded_at", { ascending: false })
    .limit(10);

  if (error) return apiError(error.message, 500);

  const balances = (rows ?? []).map((r) => rowToCamel<BankBalance>(r));

  const current: BankBalance | null = balances.length > 0 ? balances[0] : null;
  const history = balances.map((b) => ({
    amount: b.amount,
    recordedAt: b.recordedAt,
  }));

  const response: CashFlowBalanceResponse = {
    current,
    history,
  };

  return apiSuccess<CashFlowBalanceResponse>(response, { franchiseId });
}
