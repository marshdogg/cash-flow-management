import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import { supabase, rowToCamel } from "@/lib/supabase";
import type { RecurringTransaction } from "@/types/cash-flow";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isMockMode()) {
    const { mockRecurringTransactions } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    const transaction = mockRecurringTransactions.find(
      (t) => t.id === params.id
    );

    if (!transaction) {
      return apiError("Transaction not found", 404);
    }

    return apiSuccess<RecurringTransaction>(transaction);
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return apiError("Transaction not found", 404);
    return apiError(error.message, 500);
  }

  return apiSuccess<RecurringTransaction>(rowToCamel(data));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isMockMode()) {
    const body = await request.json();
    const { mockRecurringTransactions } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    const transaction = mockRecurringTransactions.find(
      (t) => t.id === params.id
    );

    if (!transaction) {
      return apiError("Transaction not found", 404);
    }

    // Apply updates
    if (body.name !== undefined) transaction.name = body.name;
    if (body.type !== undefined) transaction.type = body.type;
    if (body.amount !== undefined) transaction.amount = body.amount;
    if (body.frequency !== undefined) transaction.frequency = body.frequency;
    if (body.startDate !== undefined) transaction.startDate = body.startDate;
    if (body.status !== undefined) transaction.status = body.status;
    transaction.updatedAt = new Date().toISOString();

    return apiSuccess<RecurringTransaction>(transaction);
  }

  const body = await request.json();

  // Build snake_case update object from camelCase body
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.name !== undefined) updates.name = body.name;
  if (body.type !== undefined) updates.type = body.type;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.frequency !== undefined) updates.frequency = body.frequency;
  if (body.startDate !== undefined) updates.start_date = body.startDate;
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await supabase
    .from("recurring_transactions")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return apiError("Transaction not found", 404);
    return apiError(error.message, 500);
  }

  return apiSuccess<RecurringTransaction>(rowToCamel(data));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isMockMode()) {
    const { mockRecurringTransactions } = await import(
      "@/mocks/cash-flow-fixtures"
    );
    const index = mockRecurringTransactions.findIndex(
      (t) => t.id === params.id
    );

    if (index === -1) {
      return apiError("Transaction not found", 404);
    }

    mockRecurringTransactions.splice(index, 1);

    return apiSuccess({ deleted: params.id });
  }

  // Check existence first, then delete
  const { data: existing, error: fetchError } = await supabase
    .from("recurring_transactions")
    .select("id")
    .eq("id", params.id)
    .single();

  if (fetchError || !existing) {
    return apiError("Transaction not found", 404);
  }

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", params.id);

  if (error) return apiError(error.message, 500);

  return apiSuccess({ deleted: params.id });
}
