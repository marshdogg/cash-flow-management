"use client";

import { AlertBanner } from "./AlertBanner";

interface SessionExpiredBannerProps {
  visible: boolean;
}

export function SessionExpiredBanner({ visible }: SessionExpiredBannerProps) {
  if (!visible) return null;

  return (
    <div className="mb-6">
      <AlertBanner
        type="session-expired"
        message="Your session has expired. Please refresh the page to continue."
        actionLabel="Refresh Page"
        onAction={() => window.location.reload()}
      />
      {/* Overlay to disable interactive elements */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-white/30" aria-hidden="true" />
    </div>
  );
}
