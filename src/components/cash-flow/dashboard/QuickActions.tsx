"use client";

import Link from "next/link";
import { Play, List } from "lucide-react";
import { CASH_FLOW_ROUTES } from "@/constants/cash-flow";
import type { CashFlowUserRole } from "@/types/cash-flow";
import { RoleGate } from "@/components/cash-flow/shared/RoleGate";

interface QuickActionsProps {
  userRole: CashFlowUserRole;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
      role="navigation"
      aria-label="Quick actions"
    >
      <RoleGate
        allowedRoles={["franchise_partner"]}
        userRole={userRole}
      >
        <Link
          href={CASH_FLOW_ROUTES.ritual}
          className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Play className="h-4 w-4" />
          Start Ritual
        </Link>
      </RoleGate>

      <Link
        href={CASH_FLOW_ROUTES.recurring}
        className="inline-flex items-center gap-2 rounded-md border border-primary-500 bg-white px-4 py-2.5 text-sm font-medium text-primary-500 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <List className="h-4 w-4" />
        Manage Transactions
      </Link>
    </div>
  );
}
