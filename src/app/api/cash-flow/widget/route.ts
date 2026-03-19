import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel } from "@/lib/supabase";
import type {
  CashFlowWidgetResponse,
  WeeklySnapshot,
} from "@/types/cash-flow";
import { formatCurrency, formatHealthStatus } from "@/lib/cash-flow/format-utils";

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("franchise parameter is required", 400);
  }

  if (isMockMode()) {
    const { mockWidgetResponse } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    return apiSuccess<CashFlowWidgetResponse>(mockWidgetResponse, {
      franchiseId,
    });
  }

  // Get the latest snapshot
  const { data: rows, error } = await supabase
    .from("weekly_snapshots")
    .select("*")
    .eq("franchise_id", franchiseId)
    .order("completed_at", { ascending: false })
    .limit(1);

  if (error) return apiError(error.message, 500);

  if (!rows || rows.length === 0) {
    // No snapshot yet — empty state
    const response: CashFlowWidgetResponse = {
      tcp: {
        value: null,
        formattedValue: "—",
      },
      health: {
        status: "not_available",
        label: "Not Available",
      },
      lastReviewed: null,
    };
    return apiSuccess<CashFlowWidgetResponse>(response, { franchiseId });
  }

  const snapshot = rowToCamel<WeeklySnapshot>(rows[0]);

  const response: CashFlowWidgetResponse = {
    tcp: {
      value: snapshot.tcp,
      formattedValue: formatCurrency(snapshot.tcp),
    },
    health: {
      status: snapshot.healthStatus,
      label: formatHealthStatus(snapshot.healthStatus),
    },
    lastReviewed: snapshot.completedAt,
  };

  return apiSuccess<CashFlowWidgetResponse>(response, { franchiseId });
}
