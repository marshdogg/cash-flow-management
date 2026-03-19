"use client";

import useSWR from "swr";

const DEFAULT_TIMEZONE = "America/Toronto";

// Fetches franchise timezone from Settings API via SWR
export function useFranchiseTimezone() {
  const { data } = useSWR<{ timezone: string }>(
    "/api/franchise/settings/timezone",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return { timezone: DEFAULT_TIMEZONE };
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // Timezone rarely changes
      fallbackData: { timezone: DEFAULT_TIMEZONE },
    }
  );

  return { timezone: data?.timezone ?? DEFAULT_TIMEZONE };
}
