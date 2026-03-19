import { NextRequest } from "next/server";
import { supabase, rowToCamel, camelToRow } from "@/lib/supabase";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import type { AccountReceivable } from "@/types/cash-flow";

// ============================================
// GET — List accounts receivable for franchise
// ============================================

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("Missing required parameter: franchise", 400);
  }

  if (isMockMode()) {
    const mockAr: AccountReceivable[] = [
      {
        id: "ar-1",
        franchiseId,
        customerName: "Johnson Residence",
        amount: 2200,
        invoiceDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "ar-2",
        franchiseId,
        customerName: "Smith Commercial",
        amount: 1300,
        invoiceDate: new Date(Date.now() - 12 * 86400000).toISOString(),
        status: "overdue",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return apiSuccess(mockAr);
  }

  try {
    const { data, error } = await supabase
      .from("accounts_receivable")
      .select("*")
      .eq("franchise_id", franchiseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching AR:", error);
      return apiError("Failed to fetch accounts receivable", 500);
    }

    const items: AccountReceivable[] = (data ?? []).map(
      (row: Record<string, unknown>) => rowToCamel<AccountReceivable>(row)
    );

    return apiSuccess(items);
  } catch (err) {
    console.error("AR GET error:", err);
    return apiError("Internal server error", 500);
  }
}

// ============================================
// POST — Create new account receivable
// ============================================

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await request.json();
    const mockItem: AccountReceivable = {
      id: `ar-${Date.now()}`,
      franchiseId: body.franchiseId,
      customerName: body.customerName,
      amount: body.amount,
      invoiceDate: body.invoiceDate ?? null,
      status: body.status ?? "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return apiSuccess(mockItem);
  }

  try {
    const body = await request.json();

    const { franchiseId, customerName, amount, invoiceDate, status } = body;

    if (!franchiseId || !customerName || amount === undefined) {
      return apiError(
        "Missing required fields: franchiseId, customerName, amount",
        400
      );
    }

    const row = camelToRow({
      franchiseId,
      customerName,
      amount,
      invoiceDate: invoiceDate ?? null,
      status: status ?? "pending",
    });

    const { data, error } = await supabase
      .from("accounts_receivable")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Error creating AR:", error);
      return apiError("Failed to create account receivable", 500);
    }

    return apiSuccess(rowToCamel<AccountReceivable>(data));
  } catch (err) {
    console.error("AR POST error:", err);
    return apiError("Internal server error", 500);
  }
}
