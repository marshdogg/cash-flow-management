import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase } from "@/lib/supabase";
import { DEFAULT_BUFFER } from "@/constants/cash-flow";

// ============================================
// GET — Fetch settings for a franchise
// ============================================

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("franchise parameter is required", 400);
  }

  if (isMockMode()) {
    return apiSuccess({ minBalance: DEFAULT_BUFFER });
  }

  const { data: row, error } = await supabase
    .from("franchise_settings")
    .select("min_balance")
    .eq("franchise_id", franchiseId)
    .maybeSingle();

  if (error) return apiError(error.message, 500);

  return apiSuccess({ minBalance: row?.min_balance ?? DEFAULT_BUFFER });
}

// ============================================
// PUT — Upsert settings for a franchise
// ============================================

export async function PUT(request: NextRequest) {
  let body: { franchiseId: string; minBalance: number };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { franchiseId, minBalance } = body;

  if (!franchiseId) return apiError("franchiseId is required", 400);
  if (typeof minBalance !== "number" || minBalance < 0) {
    return apiError("minBalance must be a non-negative number", 400);
  }

  if (isMockMode()) {
    return apiSuccess({ minBalance });
  }

  const { error } = await supabase
    .from("franchise_settings")
    .upsert(
      {
        franchise_id: franchiseId,
        min_balance: minBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "franchise_id" }
    );

  if (error) return apiError(error.message, 500);

  return apiSuccess({ minBalance });
}
