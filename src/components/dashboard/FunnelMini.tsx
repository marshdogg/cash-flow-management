"use client";

import { FunnelStage } from "./FunnelStage";
import type { PipelineStage } from "@/types/dashboard";

interface FunnelMiniProps {
  stages: PipelineStage[];
}

export function FunnelMini({ stages }: FunnelMiniProps) {
  return (
    <>
      {/* Desktop — horizontal with arrows */}
      <div className="hidden md:flex items-center gap-2">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center gap-2">
            <FunnelStage stage={stage} />
            {i < stages.length - 1 && (
              <span className="text-gray-400 text-lg" aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Mobile — vertical with arrows */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex w-full flex-col items-center gap-2">
            <div className="w-full">
              <FunnelStage stage={stage} />
            </div>
            {i < stages.length - 1 && (
              <span className="text-gray-400 text-lg" aria-hidden="true">↓</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
