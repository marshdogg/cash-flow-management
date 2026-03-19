import { NextRequest } from "next/server";
import { apiSuccess, apiError, isMockMode } from "@/lib/api-response";
import type { TasksResponse } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    const { mockTasks } = await import("@/mocks/dashboard-fixtures");
    return apiSuccess<TasksResponse>(mockTasks);
  }

  return apiError("Backend not configured", 501);
}
