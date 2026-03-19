import { getSession } from "@/lib/session";
import { RecurringTransactionsShell } from "@/components/cash-flow/recurring/RecurringTransactionsShell";
import type { AssignedFranchise, CashFlowUserRole } from "@/types/cash-flow";

export default async function CashFlowRecurringPage() {
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
    <RecurringTransactionsShell
      franchiseId={session.franchiseId}
      franchiseName={session.franchiseName}
      userRole={cashFlowRole}
      assignedFranchises={assignedFranchises}
    />
  );
}
