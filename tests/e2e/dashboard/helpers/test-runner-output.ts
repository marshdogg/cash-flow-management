/**
 * Sanitized test output formatter for Cody CLI.
 * Strips internal implementation details from test results.
 */

interface TestResult {
  suite: string;
  flow: string;
  scenario: string;
  status: "pass" | "fail";
  message: string;
  duration: number;
  prdSection: string;
  priority: string;
}

export function formatTestResult(result: TestResult): string {
  const icon = result.status === "pass" ? "🟢" : "🔴";
  return [
    `${icon} ${result.status.toUpperCase()} | ${result.flow} > ${result.scenario}`,
    `   PRD: §${result.prdSection} | Priority: ${result.priority}`,
    `   ${result.message}`,
    `   Duration: ${result.duration}ms`,
  ].join("\n");
}

export function formatSummary(results: TestResult[]): string {
  const pass = results.filter((r) => r.status === "pass").length;
  const fail = results.filter((r) => r.status === "fail").length;
  return [
    "═══════════════════════════════════════",
    `Dashboard Test Suite — ${pass + fail} scenarios`,
    `🟢 Passed: ${pass}`,
    `🔴 Failed: ${fail}`,
    `Coverage: ${Math.round((pass / (pass + fail)) * 100)}%`,
    "═══════════════════════════════════════",
  ].join("\n");
}

export function sanitizeError(error: Error): string {
  // Strip file paths, line numbers, selectors, stack traces
  const msg = error.message
    .replace(/at\s+.*\(.*:\d+:\d+\)/g, "")
    .replace(/\/.*\.spec\.ts/g, "[test]")
    .replace(/locator\('.*?'\)/g, "[element]")
    .replace(/page\.\w+\(/g, "[action](")
    .trim();
  return msg || "Test assertion failed — check PRD for expected behavior";
}
