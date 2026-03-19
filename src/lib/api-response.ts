import { NextResponse } from "next/server";

/**
 * Type-safe API response helpers.
 *
 * These ensure every API route produces the correct ApiResponse<T> envelope
 * that apiFetch expects: { data: T, error: null }.
 *
 * Usage in API routes:
 *   return apiSuccess(myData);
 *   return apiSuccess(myData, { period: "month" });
 *   return apiError("Not found", 404);
 *
 * Mock mode:
 *   Use isMockMode() to check whether to return mock data or proxy to backend.
 */

/**
 * Returns true when the app is running in mock mode (no real backend).
 * Controlled by NEXT_PUBLIC_MOCK_MODE env variable.
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE !== "false";
}

interface ApiResponseBody<T> {
  data: T;
  error: null;
  meta?: Record<string, unknown>;
}

interface ApiErrorBody {
  data: null;
  error: string;
}

/**
 * Return a successful API response with the correct envelope structure.
 * The `data` parameter becomes `json.data` — which is what `apiFetch` returns to the caller.
 * If your TypeScript return type is `T`, pass `T` here directly.
 */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): NextResponse<ApiResponseBody<T>> {
  const body: ApiResponseBody<T> = { data, error: null };
  if (meta) body.meta = meta;
  return NextResponse.json(body);
}

/**
 * Return an error API response.
 */
export function apiError(message: string, status: number = 500): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { data: null, error: message },
    { status }
  );
}
