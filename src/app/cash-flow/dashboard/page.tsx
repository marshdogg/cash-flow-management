import { getSession } from "@/lib/session";
import { CashFlowDashboardShell } from "@/components/cash-flow/dashboard/CashFlowDashboardShell";
import type { AssignedFranchise, CashFlowUserRole } from "@/types/cash-flow";

export default async function CashFlowDashboardPage() {
  const session = await getSession();

  const cashFlowRole: CashFlowUserRole =
    session.role === "fom" ? "fom" : "franchise_partner";

  // FOM gets assigned franchises; FP gets their own
  const assignedFranchises: AssignedFranchise[] =
    cashFlowRole === "fom"
      ? [
          // In production, fetched from franchise assignment API
          { id: "fr_toronto_east", name: "WOW 1 DAY PAINTING — Toronto East" },
          { id: "fr_toronto_west", name: "WOW 1 DAY PAINTING — Toronto West" },
          { id: "fr_vancouver", name: "WOW 1 DAY PAINTING — Vancouver" },
        ]
      : [];

  return (
    <CashFlowDashboardShell
      franchiseId={session.franchiseId}
      franchiseName={session.franchiseName}
      userRole={cashFlowRole}
      assignedFranchises={assignedFranchises}
    />
  );
}
