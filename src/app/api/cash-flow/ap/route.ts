import { NextRequest } from "next/server";
import { supabase, rowToCamel, camelToRow } from "@/lib/supabase";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import type { AccountPayable } from "@/types/cash-flow";

// ============================================
// GET — List accounts payable for franchise
// ============================================

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("Missing required parameter: franchise", 400);
  }

  if (isMockMode()) {
    const mockAp: AccountPayable[] = [
      {
        id: "ap-1",
        franchiseId,
        vendorName: "Paint Supply Co",
        totalAmount: 4500,
        remainingAmount: 4500,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "ap-2",
        franchiseId,
        vendorName: "Equipment Rental",
        totalAmount: 3700,
        remainingAmount: 2200,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: "partial",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return apiSuccess(mockAp);
  }

  try {
    const { data, error } = await supabase
      .from("accounts_payable")
      .select("*")
      .eq("franchise_id", franchiseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching AP:", error);
      return apiError("Failed to fetch accounts payable", 500);
    }

    const items: AccountPayable[] = (data ?? []).map(
      (row: Record<string, unknown>) => rowToCamel<AccountPayable>(row)
    );

    return apiSuccess(items);
  } catch (err) {
    console.error("AP GET error:", err);
    return apiError("Internal server error", 500);
  }
}

// ============================================
// POST — Create new account payable
// ============================================

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await request.json();
    const mockItem: AccountPayable = {
      id: `ap-${Date.now()}`,
      franchiseId: body.franchiseId,
      vendorName: body.vendorName,
      totalAmount: body.totalAmount,
      remainingAmount: body.remainingAmount ?? body.totalAmount,
      dueDate: body.dueDate ?? null,
      status: body.status ?? "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return apiSuccess(mockItem);
  }

  try {
    const body = await request.json();

    const { franchiseId, vendorName, totalAmount, remainingAmount, dueDate, status } = body;

    if (!franchiseId || !vendorName || totalAmount === undefined) {
      return apiError(
        "Missing required fields: franchiseId, vendorName, totalAmount",
        400
      );
    }

    const row = camelToRow({
      franchiseId,
      vendorName,
      totalAmount,
      remainingAmount: remainingAmount ?? totalAmount,
      dueDate: dueDate ?? null,
      status: status ?? "pending",
    });

    const { data, error } = await supabase
      .from("accounts_payable")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Error creating AP:", error);
      return apiError("Failed to create account payable", 500);
    }

    return apiSuccess(rowToCamel<AccountPayable>(data));
  } catch (err) {
    console.error("AP POST error:", err);
    return apiError("Internal server error", 500);
  }
}

// ============================================
// PATCH — Update account payable status/remaining
// ============================================

export async function PATCH(request: NextRequest) {
  if (isMockMode()) {
    const body = await request.json();
    return apiSuccess({ id: body.id, updated: true });
  }

  try {
    const body = await request.json();
    const { id, status, remainingAmount } = body;

    if (!id) {
      return apiError("Missing required field: id", 400);
    }

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (remainingAmount !== undefined) updates.remaining_amount = remainingAmount;

    if (Object.keys(updates).length === 0) {
      return apiError("No fields to update. Provide status or remainingAmount.", 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("accounts_payable")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating AP:", error);
      return apiError("Failed to update account payable", 500);
    }

    return apiSuccess(rowToCamel<AccountPayable>(data));
  } catch (err) {
    console.error("AP PATCH error:", err);
    return apiError("Internal server error", 500);
  }
}
