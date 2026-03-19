import { getSession } from "@/lib/session";
import { RitualWizard } from "@/components/cash-flow/ritual/RitualWizard";
import type { AssignedFranchise } from "@/types/cash-flow";

export default async function CashFlowRitualPage() {
  const session = await getSession();

  // All roles get assigned franchises for the picker
  const assignedFranchises: AssignedFranchise[] = [
    { id: "fr_vancouver", name: "WOW 1 DAY PAINTING — Vancouver" },
    { id: "fr_calgary", name: "WOW 1 DAY PAINTING — Calgary" },
    { id: "fr_toronto_east", name: "WOW 1 DAY PAINTING — Toronto East" },
  ];

  return (
    <RitualWizard
      franchiseId={session.franchiseId}
      userName={session.userName}
      assignedFranchises={assignedFranchises}
    />
  );
}
