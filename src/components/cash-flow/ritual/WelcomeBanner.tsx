"use client";

import type { RitualWelcomeData } from "@/types/cash-flow";

interface WelcomeBannerProps {
  userName: string;
  welcomeData: RitualWelcomeData | null;
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function shortDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WelcomeBanner({ userName, welcomeData }: WelcomeBannerProps) {
  const firstName = userName.split(" ")[0] || "there";

  return (
    <div className="bg-[#f1f8e9] px-8 py-6">
      <div className="flex items-center justify-between gap-5">
        <div>
          <div className="text-xl font-bold tracking-[-0.02em] text-[#1a1a1a]">
            Good morning, {firstName}
          </div>
          <div className="mt-1 text-[13px] font-medium text-[#6b7280]">
            Let&apos;s get a clear picture of where your cash stands this week.
          </div>
        </div>

        {/* Last ritual badge */}
        {welcomeData?.lastRitualDate && (
          <div className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#c5e49a] bg-white px-3 py-1.5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#a0aab4]">
                Last ritual
              </div>
              <div className="text-xs font-bold text-[#3d6b14]">
                {relativeDate(welcomeData.lastRitualDate)} &middot; {shortDate(welcomeData.lastRitualDate)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
