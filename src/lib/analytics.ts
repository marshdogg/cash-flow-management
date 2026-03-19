/**
 * Analytics wrapper — provider-agnostic.
 * Replace the `send` implementation with your analytics provider
 * (e.g., Segment, Amplitude, PostHog, custom endpoint).
 *
 * All events follow the entity_action naming pattern.
 * Events are fire-and-forget — never block UI.
 */

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsContext {
  franchiseId: string;
  userRole: string;
  userId: string;
}

let _context: AnalyticsContext | null = null;

/**
 * Set the analytics context (call once on app init / session load).
 */
export function setAnalyticsContext(context: AnalyticsContext) {
  _context = context;
}

/**
 * Track an analytics event. Fire-and-forget — never throws.
 */
export function track(event: string, properties?: AnalyticsProperties) {
  try {
    const payload = {
      event,
      properties: {
        ...properties,
        franchise_id: _context?.franchiseId,
        user_role: _context?.userRole,
        user_id: _context?.userId,
        timestamp: new Date().toISOString(),
      },
    };

    // Use requestIdleCallback for non-critical tracking
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(() => send(payload));
    } else {
      // Fallback: defer to next microtask
      Promise.resolve().then(() => send(payload));
    }
  } catch {
    // Never let analytics break the app
  }
}

function send(payload: { event: string; properties: AnalyticsProperties }) {
  // Development: log to console
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", payload.event, payload.properties);
  }

  // Production: replace with your provider
  // Example: window.analytics?.track(payload.event, payload.properties);
}

// ─── Dashboard-specific event helpers ──────────────────────────────

export function trackDashboardViewed(tab: string, period: string) {
  track("dashboard_viewed", { tab, period });
}

export function trackTabSwitched(fromTab: string, toTab: string) {
  track("dashboard_tab_switched", { from_tab: fromTab, to_tab: toTab });
}

export function trackPeriodChanged(fromPeriod: string, toPeriod: string) {
  track("dashboard_period_changed", { from_period: fromPeriod, to_period: toPeriod });
}

export function trackTaskCompleted(taskId: string, taskType: string) {
  track("dashboard_task_completed", { task_id: taskId, task_type: taskType });
}

export function trackTaskUndo(taskId: string) {
  track("dashboard_task_undo", { task_id: taskId });
}

export function trackKpiClicked(kpiName: string, value: string) {
  track("dashboard_kpi_clicked", { kpi_name: kpiName, value });
}

export function trackFocusClicked(focusTitle: string, count: number) {
  track("dashboard_focus_clicked", { focus_title: focusTitle, count });
}

export function trackStatClicked(statLabel: string, value: string) {
  track("dashboard_stat_clicked", { stat_label: statLabel, value });
}

export function trackFunnelStageClicked(stageName: string, count: number) {
  track("dashboard_funnel_stage_clicked", { stage_name: stageName, count });
}

export function trackEstimatorClicked(estimatorId: string, estimatorName: string) {
  track("dashboard_estimator_clicked", { estimator_id: estimatorId, estimator_name: estimatorName });
}

export function trackRefreshClicked() {
  track("dashboard_refresh_clicked");
}

export function trackDashboardError(errorType: string, section: string, statusCode?: number) {
  track("dashboard_error", { error_type: errorType, section, status_code: statusCode ?? null });
}

export function trackSessionExpired() {
  track("dashboard_session_expired");
}

export function trackStaleData(minutesStale: number) {
  track("dashboard_stale_data", { minutes_stale: minutesStale });
}

export function trackToastShown(toastType: string, message: string) {
  track("dashboard_toast_shown", { toast_type: toastType, toast_message: message });
}

export function trackToastDismissed(toastType: string, autoDismiss: boolean) {
  track("dashboard_toast_dismissed", { toast_type: toastType, auto_dismiss: autoDismiss });
}

export function trackRoleAccessDenied(section: string, userRole: string) {
  track("dashboard_role_access_denied", { section, user_role: userRole, redirect_to: "overview" });
}
