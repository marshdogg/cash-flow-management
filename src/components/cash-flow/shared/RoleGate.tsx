"use client";

import type { CashFlowUserRole } from "@/types/cash-flow";
import type { ReactNode } from "react";

interface RoleGateProps {
  allowedRoles: CashFlowUserRole[];
  userRole: CashFlowUserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({
  allowedRoles,
  userRole,
  children,
  fallback = null,
}: RoleGateProps) {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
