import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RitualWizard } from "@/components/cash-flow/ritual/RitualWizard";
import { CASH_FLOW_ROUTES } from "@/constants/cash-flow";

export default async function CashFlowRitualPage() {
  const session = await getSession();

  // FOM cannot access ritual — redirect to dashboard
  if (session.role === "fom") {
    redirect(CASH_FLOW_ROUTES.dashboard);
  }

  return <RitualWizard franchiseId={session.franchiseId} userName={session.userName} />;
}
