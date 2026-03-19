import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileSidebarWrapper } from "@/components/layout/MobileSidebarWrapper";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PROFITABILITY_ALLOWED_ROLES } from "@/constants/dashboard";
import { getSession } from "@/lib/session";
import type { TabId } from "@/types/dashboard";

// Server Component — reads session, computes auth props, renders shell
export default async function DashboardPage() {
  const session = await getSession();

  const canSeeProfitability = (PROFITABILITY_ALLOWED_ROLES as readonly string[]).includes(session.role);
  const allowedTabs: TabId[] = canSeeProfitability
    ? ["overview", "sales", "profitability"]
    : ["overview", "sales"];

  const isFomContext = session.franchiseId !== session.viewingFranchiseId;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AppSidebar />
      <MobileSidebarWrapper />

      <main id="main-content" className="flex-1 lg:ml-60" aria-label="Dashboard content">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <DashboardShell
            allowedTabs={allowedTabs}
            isFomContext={isFomContext}
            franchiseName={session.franchiseName}
          />
        </div>
      </main>
    </div>
  );
}
