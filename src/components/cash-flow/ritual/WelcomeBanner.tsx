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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#3d6b14] via-[#5e9422] to-[#8BC34A] px-8 py-9">
      <div className="absolute -right-6 -top-6 h-[240px] w-[240px] rounded-full bg-white/[0.07]" />
      <div className="absolute -left-20 bottom-0 h-[160px] w-[160px] rounded-full bg-white/[0.04]" />

      <div className="relative z-[1] flex items-center justify-between gap-5">
        <div>
          <div className="text-[28px] font-extrabold tracking-[-0.03em] text-white">
            Good morning, {firstName} 👋
          </div>
          <div className="mt-1.5 text-[14px] font-medium text-white/75">
            Let&apos;s get a clear picture of where your cash stands this week.
          </div>
        </div>

        {/* Last ritual badge */}
        {welcomeData?.lastRitualDate && (
          <div className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-3xl border border-white/25 bg-white/15 px-3.5 py-2 backdrop-blur-sm">
            <span>🗓</span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/65">
                Last ritual
              </div>
              <div className="text-xs font-bold text-white">
                {relativeDate(welcomeData.lastRitualDate)} &middot; {shortDate(welcomeData.lastRitualDate)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
