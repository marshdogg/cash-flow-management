import { test, expect } from "@playwright/test";

const BASE = "/api/cash-flow/dashboard";
const FRANCHISE = "fr_toronto_east";

test.describe("Cash Flow Dashboard API — GET /dashboard", () => {
  test("returns dashboard data with envelope structure", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.error).toBeNull();
    expect(json.meta).toMatchObject({ franchiseId: FRANCHISE });
  });

  test("tcp section has required fields", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { tcp } = (await res.json()).data;

    expect(tcp).toMatchObject({
      value: expect.any(Number),
      formattedValue: expect.any(String),
      bankBalance: expect.any(Number),
      pendingInflows: expect.any(Number),
      pendingOutflows: expect.any(Number),
    });
    expect(tcp.formattedValue).toMatch(/^\$[\d,]+\.\d{2}$/);
  });

  test("health section has required fields", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { health } = (await res.json()).data;

    expect(health).toMatchObject({
      status: expect.stringMatching(
        /^(critical|caution|healthy|not_available)$/
      ),
      formattedRunway: expect.any(String),
    });
    // weeksOfRunway can be number or null
    expect(
      typeof health.weeksOfRunway === "number" ||
        health.weeksOfRunway === null
    ).toBe(true);
  });

  test("netWeeklyCashFlow section has required fields", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { netWeeklyCashFlow } = (await res.json()).data;

    expect(netWeeklyCashFlow).toMatchObject({
      value: expect.any(Number),
      formattedValue: expect.any(String),
    });
  });

  test("projection contains 13-week forecast array", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { projection } = (await res.json()).data;

    expect(projection).not.toBeNull();
    expect(Array.isArray(projection.weeks)).toBe(true);
    expect(projection.weeks.length).toBeGreaterThanOrEqual(13);

    for (const week of projection.weeks) {
      expect(week).toMatchObject({
        week: expect.any(Number),
        projected: expect.any(Number),
        upperBound: expect.any(Number),
        lowerBound: expect.any(Number),
      });
      expect(week.upperBound).toBeGreaterThanOrEqual(week.projected);
      expect(week.lowerBound).toBeLessThanOrEqual(week.projected);
    }
  });

  test("projection weeks are in ascending order", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { projection } = (await res.json()).data;

    for (let i = 1; i < projection.weeks.length; i++) {
      expect(projection.weeks[i].week).toBeGreaterThan(
        projection.weeks[i - 1].week
      );
    }
  });

  test("lastRitual section has required fields", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { lastRitual } = (await res.json()).data;

    // completedAt and daysSince can be string/number or null
    expect(lastRitual).toBeDefined();
    expect("completedAt" in lastRitual).toBe(true);
    expect("daysSince" in lastRitual).toBe(true);

    if (lastRitual.completedAt !== null) {
      expect(typeof lastRitual.completedAt).toBe("string");
      // Should be a valid ISO date
      expect(new Date(lastRitual.completedAt).toISOString()).toBeDefined();
    }
    if (lastRitual.daysSince !== null) {
      expect(typeof lastRitual.daysSince).toBe("number");
      expect(lastRitual.daysSince).toBeGreaterThanOrEqual(0);
    }
  });

  test("tcp value equals bankBalance + pendingInflows - pendingOutflows", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { tcp } = (await res.json()).data;

    if (tcp.value !== null && tcp.bankBalance !== null) {
      expect(tcp.value).toBe(
        tcp.bankBalance + tcp.pendingInflows - tcp.pendingOutflows
      );
    }
  });

  test("returns 400 when franchise param is missing", async ({ request }) => {
    const res = await request.get(BASE);
    expect(res.status()).toBe(400);

    const json = await res.json();
    expect(json.data).toBeNull();
    expect(json.error).toBe("franchise parameter is required");
  });
});
