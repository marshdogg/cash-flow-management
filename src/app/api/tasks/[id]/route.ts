import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  if (body.status !== "completed") {
    return apiError("Invalid status", 400);
  }

  // In production: validate session, check franchise ownership, update task
  // Mock: simulate success
  return apiSuccess({ id: params.id, status: "completed" });
}
