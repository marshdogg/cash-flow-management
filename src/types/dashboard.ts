export interface KpiData {
  value: number | null;
  formattedValue: string;
  trend: {
    direction: "up" | "down" | "flat" | "new";
    percentage: number | null;
  };
  target: {
    value: number;
    achievement: number;
  } | null;
  alert: boolean;
}

export interface FocusItem {
  count: number;
  detail: string;
  style: "standard" | "urgent" | "warning";
  destinationUrl: string;
  icon: string;
  title: string;
}

export interface StatData {
  value: number | null;
  formattedValue: string;
  subtitle: string;
  style: "standard" | "success" | "alert";
  destinationUrl: string;
}

export interface PipelineStage {
  name: string;
  count: number | null;
  trend: {
    direction: "up" | "down" | "flat";
    percentage: number;
  };
  destinationUrl: string;
}

export interface EstimatorPerformance {
  id: string;
  name: string;
  avatarColor: string;
  estimateCount: number;
  closeRate: number;
  closeRateStyle: "success" | "warning" | "danger";
  profileUrl: string;
}

export interface PLLine {
  label: string;
  amount: number | null;
  formattedAmount: string;
  style: "standard" | "subtotal" | "total";
}

export interface DashboardTask {
  id: string;
  title: string;
  type: "call" | "email" | "todo" | "followup";
  dueDate: string;
  dueTime: string | null;
  isOverdue: boolean;
  daysOverdue: number;
  recordType: string | null;
  recordId: string | null;
  recordName: string | null;
  recordUrl: string | null;
}

export interface OverviewResponse {
  kpis: {
    revenue: KpiData;
    grossProfit: KpiData;
    closeRate: KpiData;
    callbackRate: KpiData;
  };
  focus: {
    qualCallsNeeded: FocusItem;
    estimatesScheduled: FocusItem;
    followUpsDue: FocusItem;
    projectsInProgress: FocusItem;
    casesNeedingAttention: FocusItem;
  };
  quickStats: {
    completedJobs: StatData;
    inPipeline: StatData;
    collected: StatData;
    outstanding: StatData;
  };
}

export interface SalesResponse {
  pipeline: PipelineStage[];
  metrics: {
    closeRate: StatData;
    avgEstimateValue: StatData;
    pipelineValue: StatData;
    cancellationRate: StatData;
  };
  estimators: EstimatorPerformance[];
}

export interface ProfitabilityResponse {
  kpis: {
    revenue: KpiData;
    grossProfit: KpiData;
    gpMargin: KpiData;
    laborOverage: KpiData;
  };
  plSummary: PLLine[];
  collections: {
    invoiced: StatData;
    collected: StatData;
    outstanding: StatData;
    avgDaysToPay: StatData;
  };
}

export interface TasksResponse {
  data: DashboardTask[];
  meta: {
    total: number;
    hasMore: boolean;
  };
}

export interface TaskUpdateRequest {
  status: "completed";
}

export type TabId = "overview" | "sales" | "profitability";
export type PeriodId = "today" | "week" | "month" | "ytd";

export type KpiVariant = "standard" | "highlight" | "alert";
export type RefreshState = "default" | "loading" | "success" | "error";

export interface UserSession {
  userId: string;
  franchiseId: string;
  viewingFranchiseId: string;
  role: "franchise_partner" | "ops_manager" | "fom" | "admin" | "estimator" | "project_manager";
  userName: string;
  franchiseName: string;
}
