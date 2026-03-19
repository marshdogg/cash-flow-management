import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel, camelToRow } from "@/lib/supabase";
import type {
  RecurringTransactionsResponse,
  RecurringTransaction,
} from "@/types/cash-flow";
import { FREQUENCY_WEEKLY_DIVISORS } from "@/constants/cash-flow";

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchise");

  if (!franchiseId) {
    return apiError("franchise parameter is required", 400);
  }

  if (isMockMode()) {
    const { mockRecurringTransactionsResponse } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    return apiSuccess<RecurringTransactionsResponse>(
      mockRecurringTransactionsResponse,
      { franchiseId }
    );
  }

  const { data: rows, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("franchise_id", franchiseId)
    .order("created_at", { ascending: true });

  if (error) return apiError(error.message, 500);

  const transactions = (rows ?? []).map((r) =>
    rowToCamel<RecurringTransaction>(r)
  );

  const activeTransactions = transactions.filter((t) => t.status === "active");
  const totalMonthlyRecurring = activeTransactions.reduce((sum, t) => {
    const monthlyMultiplier = FREQUENCY_WEEKLY_DIVISORS[t.frequency] / 4.33;
    return sum + t.amount / monthlyMultiplier;
  }, 0);

  const response: RecurringTransactionsResponse = {
    transactions,
    meta: {
      total: transactions.length,
      activeCount: activeTransactions.length,
      totalMonthlyRecurring: Math.round(totalMonthlyRecurring * 100) / 100,
      incomeCount: transactions.filter((t) => t.type === "income").length,
      expenseCount: transactions.filter((t) => t.type === "expense").length,
    },
  };

  return apiSuccess<RecurringTransactionsResponse>(response, { franchiseId });
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    const body = await request.json();
    const newTransaction: RecurringTransaction = {
      id: `txn_${Date.now()}`,
      franchiseId: body.franchiseId,
      name: body.name,
      type: body.type ?? "expense",
      amount: body.amount,
      frequency: body.frequency,
      startDate: body.startDate,
      nextOccurrence: body.startDate,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: body.description,
      category: body.category ?? "other",
      dayOfMonth: body.dayOfMonth,
      endDate: body.endDate,
      notes: body.notes,
    };

    return apiSuccess<RecurringTransaction>(newTransaction);
  }

  const body = await request.json();

  const row = camelToRow({
    franchiseId: body.franchiseId,
    name: body.name,
    type: body.type ?? "expense",
    amount: body.amount,
    frequency: body.frequency,
    startDate: body.startDate,
    nextOccurrence: body.startDate,
    status: "active",
    description: body.description ?? null,
    category: body.category ?? "other",
    dayOfMonth: body.dayOfMonth ?? null,
    endDate: body.endDate ?? null,
    notes: body.notes ?? null,
  });

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert(row)
    .select()
    .single();

  if (error) return apiError(error.message, 500);

  return apiSuccess<RecurringTransaction>(rowToCamel(data));
}

export async function PATCH(request: NextRequest) {
  // Bulk action endpoint
  if (isMockMode()) {
    const body = await request.json();
    const { ids, action } = body as {
      ids: string[];
      action: "pause" | "resume" | "delete";
    };
    return apiSuccess({ updated: ids.length });
  }

  const body = await request.json();
  const { ids, action } = body as {
    ids: string[];
    action: "pause" | "resume" | "delete";
  };

  if (action === "delete") {
    const { error } = await supabase
      .from("recurring_transactions")
      .delete()
      .in("id", ids);
    if (error) return apiError(error.message, 500);
  } else {
    const newStatus = action === "pause" ? "paused" : "active";
    const { error } = await supabase
      .from("recurring_transactions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return apiError(error.message, 500);
  }

  return apiSuccess({ updated: ids.length });
}
