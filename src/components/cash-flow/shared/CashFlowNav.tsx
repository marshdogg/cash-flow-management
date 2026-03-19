"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LayoutDashboard, RefreshCw, ArrowRightLeft, TrendingUp } from "lucide-react";
import { CASH_FLOW_ROUTES } from "@/constants/cash-flow";
import type { CashFlowUserRole } from "@/types/cash-flow";

interface CashFlowNavProps {
  userRole: CashFlowUserRole;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: CASH_FLOW_ROUTES.dashboard,
    icon: LayoutDashboard,
    roles: ["franchise_partner", "fom"] as CashFlowUserRole[],
  },
  {
    label: "Weekly Ritual",
    href: CASH_FLOW_ROUTES.ritual,
    icon: RefreshCw,
    roles: ["franchise_partner", "fom"] as CashFlowUserRole[],
  },
  {
    label: "Recurring Transactions",
    href: CASH_FLOW_ROUTES.recurring,
    icon: ArrowRightLeft,
    roles: ["franchise_partner", "fom"] as CashFlowUserRole[],
  },
  {
    label: "Revenue Items",
    href: CASH_FLOW_ROUTES.revenueItems,
    icon: TrendingUp,
    roles: ["franchise_partner", "fom"] as CashFlowUserRole[],
  },
];

export function CashFlowNav({ userRole }: CashFlowNavProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <nav
      className="hidden w-60 flex-shrink-0 bg-sidebar lg:block"
      aria-label="Cash Flow Guide navigation"
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.08] px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500">
          <span className="text-xs font-bold text-white">CF</span>
        </div>
        <h1 className="text-[15px] font-semibold text-white">
          Cash Flow Guide
        </h1>
      </div>

      <ul className="mt-4 space-y-0.5 px-3">
        {visibleItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              {index > 0 && (
                <div className="mx-3 my-1 h-px bg-white/[0.06]" aria-hidden="true" />
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-r-[3px] border-r-primary-500 bg-sidebar-active text-white"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white/90"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
