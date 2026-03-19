import { getSession } from "@/lib/session";
import { RitualWizard } from "@/components/cash-flow/ritual/RitualWizard";

interface RitualPageProps {
  searchParams: { franchise?: string };
}

export default async function CashFlowRitualPage({ searchParams }: RitualPageProps) {
  const session = await getSession();

  // Use franchise from URL query param (set by dashboard picker), fall back to session
  const franchiseId = searchParams.franchise || session.franchiseId;

  return (
    <RitualWizard
      franchiseId={franchiseId}
      userName={session.userName}
    />
  );
}
