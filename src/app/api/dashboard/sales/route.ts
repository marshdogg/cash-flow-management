import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import type { SalesResponse } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") ?? "month";

  if (isMockMode()) {
    const { mockSales } = await import("@/mocks/dashboard-fixtures");
    return apiSuccess<SalesResponse>(mockSales, { period });
  }

  return apiError("Backend not configured", 501);
}
