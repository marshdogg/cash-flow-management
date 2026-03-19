import { getSession } from "@/lib/session";
import { RevenueItemsShell } from "@/components/cash-flow/revenue-items/RevenueItemsShell";
import type { AssignedFranchise, CashFlowUserRole } from "@/types/cash-flow";

export default async function CashFlowRevenueItemsPage() {
  const session = await getSession();

  const cashFlowRole: CashFlowUserRole =
    session.role === "fom" ? "fom" : "franchise_partner";

  const assignedFranchises: AssignedFranchise[] =
    cashFlowRole === "fom"
      ? [
          { id: "fr_toronto_east", name: "WOW 1 DAY PAINTING — Toronto East" },
          { id: "fr_toronto_west", name: "WOW 1 DAY PAINTING — Toronto West" },
          { id: "fr_vancouver", name: "WOW 1 DAY PAINTING — Vancouver" },
        ]
      : [];

  return (
    <RevenueItemsShell
      franchiseId={session.franchiseId}
      franchiseName={session.franchiseName}
      userRole={cashFlowRole}
      assignedFranchises={assignedFranchises}
    />
  );
}
