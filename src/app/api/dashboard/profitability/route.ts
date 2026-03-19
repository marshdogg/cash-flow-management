import { NextRequest } from "next/server";
import { PROFITABILITY_ALLOWED_ROLES } from "@/constants/dashboard";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import type { ProfitabilityResponse } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") ?? "month";

  if (isMockMode()) {
    const { mockProfitability, mockSession } = await import("@/mocks/dashboard-fixtures");

    // In production: check session role server-side
    const session = mockSession;
    if (!(PROFITABILITY_ALLOWED_ROLES as readonly string[]).includes(session.role)) {
      return apiError("Forbidden", 403);
    }

    return apiSuccess<ProfitabilityResponse>(mockProfitability, { period });
  }

  return apiError("Backend not configured", 501);
}
