/**
 * MSW request handlers for Dashboard Flow.
 * Used during development to serve mock data before backend APIs exist.
 *
 * Setup: Import and register these handlers with MSW's setupWorker (browser)
 * or setupServer (Node.js/tests).
 */
import {
  mockOverview,
  mockSales,
  mockProfitability,
  mockTasks,
} from "./dashboard-fixtures";

// Note: These handlers are designed for MSW v2 syntax.
// Actual MSW setup would use:
//   import { http, HttpResponse } from 'msw';
//   import { setupWorker } from 'msw/browser';
//
// For now, we export handler definitions that can be registered when MSW is installed.

export const dashboardHandlers = {
  overview: {
    method: "GET" as const,
    path: "/api/dashboard/overview",
    handler: () => ({
      status: 200,
      body: { data: mockOverview, error: null, meta: { period: "month" } },
    }),
  },
  sales: {
    method: "GET" as const,
    path: "/api/dashboard/sales",
    handler: () => ({
      status: 200,
      body: { data: mockSales, error: null, meta: { period: "month" } },
    }),
  },
  profitability: {
    method: "GET" as const,
    path: "/api/dashboard/profitability",
    handler: () => ({
      status: 200,
      body: { data: mockProfitability, error: null, meta: { period: "month" } },
    }),
  },
  tasksList: {
    method: "GET" as const,
    path: "/api/tasks",
    handler: () => ({
      status: 200,
      body: { data: mockTasks.data, error: null, meta: mockTasks.meta },
    }),
  },
  taskComplete: {
    method: "PATCH" as const,
    path: "/api/tasks/:id",
    handler: (params: { id: string }) => ({
      status: 200,
      body: { data: { id: params.id, status: "completed" }, error: null },
    }),
  },
};

/**
 * Error simulation handlers for testing error states.
 * Use these in tests or dev mode to trigger specific error conditions.
 */
export const errorHandlers = {
  sessionExpired: {
    method: "GET" as const,
    path: "/api/dashboard/*",
    handler: () => ({
      status: 401,
      body: { data: null, error: "Session expired" },
    }),
  },
  taskCompleteFail: {
    method: "PATCH" as const,
    path: "/api/tasks/:id",
    handler: () => ({
      status: 500,
      body: { data: null, error: "Failed to complete task" },
    }),
  },
  taskNotFound: {
    method: "PATCH" as const,
    path: "/api/tasks/:id",
    handler: () => ({
      status: 404,
      body: { data: null, error: "Task not found" },
    }),
  },
  partialFailure: {
    method: "GET" as const,
    path: "/api/dashboard/sales",
    handler: () => ({
      status: 500,
      body: { data: null, error: "Failed to load sales data" },
    }),
  },
};
