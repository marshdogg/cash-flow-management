import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel } from "@/lib/supabase";
import type {
  RevenueItem,
  RevenueItemsResponse,
  UpdateRevenueItemRequest,
  CreateRevenueItemRequest,
  RevenueCategory,
} from "@/types/cash-flow";
import {
  DEFAULT_AR_COLLECTION_RATE,
  DEFAULT_SALES_CANCELLATION_RATE,
  DEFAULT_PROPOSALS_CLOSE_RATE,
} from "@/constants/cash-flow";

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
// POST — Create a revenue item
// ============================================

function getAdjustmentRate(category: RevenueCategory): number {
  switch (category) {
    case "ar":
      return DEFAULT_AR_COLLECTION_RATE;
    case "sales":
      return 100 - DEFAULT_SALES_CANCELLATION_RATE;
    case "proposal":
      return DEFAULT_PROPOSALS_CLOSE_RATE;
  }
}

export async function POST(request: NextRequest) {
  let body: { franchiseId: string } & CreateRevenueItemRequest;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { franchiseId, note, category, grossAmount, expectedDate, week } = body;
  if (!franchiseId) return apiError("franchiseId is required", 400);
  if (!note?.trim()) return apiError("note is required", 400);
  if (!category) return apiError("category is required", 400);
  if (!grossAmount || grossAmount <= 0) return apiError("grossAmount must be positive", 400);
  if (!expectedDate) return apiError("expectedDate is required", 400);
  if (!week) return apiError("week is required", 400);

  const adjustmentRate = getAdjustmentRate(category);
  const adjustedAmount = Math.round(grossAmount * (adjustmentRate / 100) * 100) / 100;
  const now = new Date().toISOString();

  const newItem: RevenueItem = {
    id: crypto.randomUUID(),
    franchiseId,
    note: note.trim(),
    category,
    grossAmount,
    adjustedAmount,
    adjustmentRate,
    week,
    expectedDate,
    status: "open",
    ritualDate: now.split("T")[0],
    createdAt: now,
    updatedAt: now,
  };

  if (isMockMode()) {
    return apiSuccess(newItem);
  }

  const { error } = await supabase.from("revenue_items").insert({
    id: newItem.id,
    franchise_id: newItem.franchiseId,
    note: newItem.note,
    category: newItem.category,
    gross_amount: newItem.grossAmount,
    adjusted_amount: newItem.adjustedAmount,
    adjustment_rate: newItem.adjustmentRate,
    week: newItem.week,
    expected_date: newItem.expectedDate,
    status: newItem.status,
    ritual_date: newItem.ritualDate,
    created_at: newItem.createdAt,
    updated_at: newItem.updatedAt,
  });

  if (error) return apiError(error.message, 500);

  return apiSuccess(newItem);
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
