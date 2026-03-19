import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import type { OverviewResponse } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") ?? "month";

  if (isMockMode()) {
    const { mockOverview } = await import("@/mocks/dashboard-fixtures");
    return apiSuccess<OverviewResponse>(mockOverview, { period });
  }

  // Production: proxy to real backend
  // const data = await fetchFromBackend(`/dashboard/overview?period=${period}`);
  // return apiSuccess<OverviewResponse>(data, { period });
  return apiError("Backend not configured", 501);
}
