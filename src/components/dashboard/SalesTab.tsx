"use client";

import { FunnelMini } from "./FunnelMini";
import { StatCard } from "./StatCard";
import { EstimatorPerformance } from "./EstimatorPerformance";
import { MAX_ESTIMATORS_DISPLAYED } from "@/constants/dashboard";
import type { SalesResponse } from "@/types/dashboard";

interface SalesTabProps {
  data: SalesResponse;
}

export function SalesTab({ data }: SalesTabProps) {
  return (
    <div
      role="tabpanel"
      id="tabpanel-sales"
      aria-labelledby="tab-sales"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Column 1: Pipeline + Metrics */}
        <div className="space-y-6">
          {/* Sales Pipeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Sales Pipeline</h2>
            <div className="mt-4">
              <FunnelMini stages={data.pipeline} />
            </div>
          </div>

          {/* Sales Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Sales Metrics</h2>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <StatCard label="Close Rate" data={data.metrics.closeRate} />
              <StatCard label="Avg. Estimate Value" data={data.metrics.avgEstimateValue} />
              <StatCard label="Pipeline Value" data={data.metrics.pipelineValue} />
              <StatCard label="Cancellation Rate" data={data.metrics.cancellationRate} />
            </div>
          </div>
        </div>

        {/* Column 2: Estimator Performance */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-gray-900">Estimator Performance</h2>
          <div className="mt-3">
            <EstimatorPerformance
              estimators={data.estimators.slice(0, MAX_ESTIMATORS_DISPLAYED)}
              totalCount={data.estimators.length > MAX_ESTIMATORS_DISPLAYED ? data.estimators.length : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
