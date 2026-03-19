import type {
  CashFlowDashboardResponse,
  RecurringTransactionsResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CompleteRitualRequest,
  CompleteRitualResponse,
  CashFlowWidgetResponse,
  CashFlowBalanceResponse,
  RecurringTransaction,
  BulkAction,
  RevenueItemsResponse,
  UpdateRevenueItemRequest,
} from "@/types/cash-flow";
import { CASH_FLOW_API_ROUTES } from "@/constants/cash-flow";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions {
  signal?: AbortSignal;
}

async function apiFetch<T>(
  url: string,
  options: FetchOptions & RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 401 || response.status === 403) {
    throw new ApiError("Session expired", response.status, "SESSION_EXPIRED");
  }
  if (response.status === 404) {
    throw new ApiError("Not found", response.status, "NOT_FOUND");
  }
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status
    );
  }

  const json = await response.json();
  if (json.error) {
    throw new ApiError(json.error, response.status);
  }
  return json.data;
}

// ============================================
// Dashboard
// ============================================

export function fetchDashboard(
  franchiseId: string,
  options?: FetchOptions
): Promise<CashFlowDashboardResponse> {
  return apiFetch<CashFlowDashboardResponse>(
    `${CASH_FLOW_API_ROUTES.dashboard}?franchise=${franchiseId}`,
    options
  );
}

// ============================================
// Recurring Transactions
// ============================================

export function fetchRecurringTransactions(
  franchiseId: string,
  options?: FetchOptions
): Promise<RecurringTransactionsResponse> {
  return apiFetch<RecurringTransactionsResponse>(
    `${CASH_FLOW_API_ROUTES.recurring}?franchise=${franchiseId}`,
    options
  );
}

export function createTransaction(
  franchiseId: string,
  data: CreateTransactionRequest
): Promise<RecurringTransaction> {
  return apiFetch<RecurringTransaction>(CASH_FLOW_API_ROUTES.recurring, {
    method: "POST",
    body: JSON.stringify({ ...data, franchiseId }),
  });
}

export function updateTransaction(
  transactionId: string,
  data: UpdateTransactionRequest
): Promise<RecurringTransaction> {
  return apiFetch<RecurringTransaction>(
    `${CASH_FLOW_API_ROUTES.recurring}/${transactionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export function deleteTransaction(transactionId: string): Promise<void> {
  return apiFetch<void>(
    `${CASH_FLOW_API_ROUTES.recurring}/${transactionId}`,
    { method: "DELETE" }
  );
}

export function bulkActionTransactions(
  transactionIds: string[],
  action: BulkAction
): Promise<void> {
  return apiFetch<void>(`${CASH_FLOW_API_ROUTES.recurring}`, {
    method: "PATCH",
    body: JSON.stringify({ ids: transactionIds, action }),
  });
}

// ============================================
// Ritual
// ============================================

export function completeRitual(
  franchiseId: string,
  data: CompleteRitualRequest
): Promise<CompleteRitualResponse> {
  return apiFetch<CompleteRitualResponse>(CASH_FLOW_API_ROUTES.ritual, {
    method: "POST",
    body: JSON.stringify({ ...data, franchiseId }),
  });
}

// ============================================
// Balance
// ============================================

export function fetchBalance(
  franchiseId: string,
  options?: FetchOptions
): Promise<CashFlowBalanceResponse> {
  return apiFetch<CashFlowBalanceResponse>(
    `${CASH_FLOW_API_ROUTES.balance}?franchise=${franchiseId}`,
    options
  );
}

// ============================================
// Widget
// ============================================

export function fetchWidget(
  franchiseId: string,
  options?: FetchOptions
): Promise<CashFlowWidgetResponse> {
  return apiFetch<CashFlowWidgetResponse>(
    `${CASH_FLOW_API_ROUTES.widget}?franchise=${franchiseId}`,
    options
  );
}

// ============================================
// Revenue Items
// ============================================

export function fetchRevenueItems(
  franchiseId: string,
  options?: FetchOptions
): Promise<RevenueItemsResponse> {
  return apiFetch<RevenueItemsResponse>(
    `${CASH_FLOW_API_ROUTES.revenueItems}?franchise=${franchiseId}`,
    options
  );
}

export function updateRevenueItem(
  itemId: string,
  data: UpdateRevenueItemRequest
): Promise<void> {
  return apiFetch<void>(CASH_FLOW_API_ROUTES.revenueItems, {
    method: "PATCH",
    body: JSON.stringify({ id: itemId, ...data }),
  });
}

export function deleteRevenueItems(ids: string[]): Promise<void> {
  return apiFetch<void>(CASH_FLOW_API_ROUTES.revenueItems, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}
