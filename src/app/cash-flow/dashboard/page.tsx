import { getSession } from "@/lib/session";
import { CashFlowDashboardShell } from "@/components/cash-flow/dashboard/CashFlowDashboardShell";
import type { AssignedFranchise, CashFlowUserRole } from "@/types/cash-flow";

export default async function CashFlowDashboardPage() {
  const session = await getSession();

  const cashFlowRole: CashFlowUserRole =
    session.role === "fom" ? "fom" : "franchise_partner";

  // All roles get assigned franchises for the picker
  const assignedFranchises: AssignedFranchise[] = [
    { id: "fr_vancouver", name: "WOW 1 DAY PAINTING — Vancouver" },
    { id: "fr_calgary", name: "WOW 1 DAY PAINTING — Calgary" },
    { id: "fr_toronto_east", name: "WOW 1 DAY PAINTING — Toronto East" },
  ];

  return (
    <CashFlowDashboardShell
      franchiseId={session.franchiseId}
      franchiseName={session.franchiseName}
      userRole={cashFlowRole}
      assignedFranchises={assignedFranchises}
    />
  );
}
