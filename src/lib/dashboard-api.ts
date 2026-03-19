import type {
  OverviewResponse,
  SalesResponse,
  ProfitabilityResponse,
  TasksResponse,
  TaskUpdateRequest,
  PeriodId,
} from "@/types/dashboard";

const API_BASE = "/api";

interface FetchOptions {
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta?: Record<string, unknown>;
}

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

async function apiFetch<T>(url: string, options: FetchOptions & RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
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

  const json: ApiResponse<T> = await response.json();

  if (json.error) {
    throw new ApiError(json.error, response.status);
  }

  return json.data;
}

export function fetchOverview(period: PeriodId, options?: FetchOptions): Promise<OverviewResponse> {
  return apiFetch<OverviewResponse>(
    `${API_BASE}/dashboard/overview?period=${period}`,
    options
  );
}

export function fetchSales(period: PeriodId, options?: FetchOptions): Promise<SalesResponse> {
  return apiFetch<SalesResponse>(
    `${API_BASE}/dashboard/sales?period=${period}`,
    options
  );
}

export function fetchProfitability(period: PeriodId, options?: FetchOptions): Promise<ProfitabilityResponse> {
  return apiFetch<ProfitabilityResponse>(
    `${API_BASE}/dashboard/profitability?period=${period}`,
    options
  );
}

export function fetchTasks(_period: PeriodId, options?: FetchOptions): Promise<TasksResponse> {
  // Tasks are always "today" scoped regardless of period selector
  return apiFetch<TasksResponse>(
    `${API_BASE}/tasks?assigned_to=me&status=open&due_date_lte=today&limit=6&sort=due_date:asc`,
    options
  );
}

export async function completeTask(taskId: string): Promise<void> {
  await apiFetch<void>(`${API_BASE}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" } satisfies TaskUpdateRequest),
  });
}

export { ApiError };
