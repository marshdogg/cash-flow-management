import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel } from "@/lib/supabase";
import type {
  RevenueItem,
  RevenueItemsResponse,
  UpdateRevenueItemRequest,
} from "@/types/cash-flow";

// ============================================
// GET — Fetch all revenue items
// ============================================

export async function GET(request: NextRequest) {
  const franchise = request.nextUrl.searchParams.get("franchise");

  if (!franchise) {
    return apiError("franchise query param is required", 400);
  }

  if (isMockMode()) {
    const { mockRevenueItemsResponse } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    return apiSuccess<RevenueItemsResponse>(mockRevenueItemsResponse, {
      franchiseId: franchise,
    });
  }

  const { data: rows, error } = await supabase
    .from("revenue_items")
    .select("*")
    .eq("franchise_id", franchise)
    .order("expected_date", { ascending: true });

  if (error) return apiError(error.message, 500);

  const items = (rows ?? []).map((r) => rowToCamel<RevenueItem>(r));

  const meta = {
    total: items.length,
    arCount: items.filter((i) => i.category === "ar").length,
    salesCount: items.filter((i) => i.category === "sales").length,
    proposalCount: items.filter((i) => i.category === "proposal").length,
    openCount: items.filter((i) => i.status === "open").length,
    collectedCount: items.filter((i) => i.status === "collected").length,
    totalGross: items
      .filter((i) => i.status === "open")
      .reduce((s, i) => s + i.grossAmount, 0),
    totalAdjusted: items
      .filter((i) => i.status === "open")
      .reduce((s, i) => s + i.adjustedAmount, 0),
  };

  return apiSuccess<RevenueItemsResponse>({ items, meta }, { franchiseId: franchise });
}

// ============================================
// PATCH — Update a revenue item
// ============================================

export async function PATCH(request: NextRequest) {
  let body: { id: string } & UpdateRevenueItemRequest;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { id, ...updates } = body;
  if (!id) return apiError("id is required", 400);

  if (isMockMode()) {
    return apiSuccess({ id, ...updates });
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.note !== undefined) updateData.note = updates.note;
  if (updates.grossAmount !== undefined) updateData.gross_amount = updates.grossAmount;
  if (updates.expectedDate !== undefined) updateData.expected_date = updates.expectedDate;
  if (updates.week !== undefined) updateData.week = updates.week;
  if (updates.status === "collected") updateData.collected_date = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("revenue_items")
    .update(updateData)
    .eq("id", id);

  if (error) return apiError(error.message, 500);

  return apiSuccess({ id, ...updates });
}

// ============================================
// DELETE — Delete revenue item(s)
// ============================================

export async function DELETE(request: NextRequest) {
  let body: { ids: string[] };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  if (!body.ids || body.ids.length === 0) {
    return apiError("ids array is required", 400);
  }

  if (isMockMode()) {
    return apiSuccess({ deleted: body.ids.length });
  }

  const { error } = await supabase
    .from("revenue_items")
    .delete()
    .in("id", body.ids);

  if (error) return apiError(error.message, 500);

  return apiSuccess({ deleted: body.ids.length });
}
