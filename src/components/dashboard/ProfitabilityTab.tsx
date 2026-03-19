"use client";

import { KpiGrid } from "./KpiGrid";
import { PLSummary } from "./PLSummary";
import { CollectionsGrid } from "./CollectionsGrid";
import type { ProfitabilityResponse, KpiVariant } from "@/types/dashboard";

interface ProfitabilityTabProps {
  data: ProfitabilityResponse;
}

export function ProfitabilityTab({ data }: ProfitabilityTabProps) {
  const kpiItems: { label: string; data: ProfitabilityResponse["kpis"][keyof ProfitabilityResponse["kpis"]]; variant?: KpiVariant }[] = [
    { label: "Revenue", data: data.kpis.revenue },
    { label: "Gross Profit", data: data.kpis.grossProfit },
    { label: "GP Margin", data: data.kpis.gpMargin },
    {
      label: "Labor Overages",
      data: data.kpis.laborOverage,
      variant: data.kpis.laborOverage.alert ? "alert" : undefined,
    },
  ];

  return (
    <div
      role="tabpanel"
      id="tabpanel-profitability"
      aria-labelledby="tab-profitability"
      className="space-y-6"
    >
      {/* KPI Cards */}
      <KpiGrid items={kpiItems} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Column 1: P&L Summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-gray-900">P&L Summary</h2>
          <div className="mt-3">
            <PLSummary lines={data.plSummary} />
          </div>
        </div>

        {/* Column 2: Collections */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-gray-900">Collections</h2>
          <div className="mt-3">
            <CollectionsGrid
              invoiced={data.collections.invoiced}
              collected={data.collections.collected}
              outstanding={data.collections.outstanding}
              avgDaysToPay={data.collections.avgDaysToPay}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
