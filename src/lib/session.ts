import type { UserSession } from "@/types/dashboard";

/**
 * Server-side session retrieval.
 * In production, reads from auth middleware / cookies / headers.
 * Falls back to mock data for development.
 */
export async function getSession(): Promise<UserSession> {
  // Production: read session from auth provider
  // return await getServerSession(authOptions);

  // Development fallback — dynamically import mock to keep it out of component bundles
  const { mockSession } = await import("@/mocks/dashboard-fixtures");
  return mockSession;
}
