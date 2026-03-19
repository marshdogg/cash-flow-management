import { test, expect } from "@playwright/test";

const BASE = "/api/cash-flow/widget";
const FRANCHISE = "fr_toronto_east";

test.describe("Cash Flow Widget API — GET /widget", () => {
  test("returns widget data with envelope structure", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.error).toBeNull();
    expect(json.meta).toMatchObject({ franchiseId: FRANCHISE });
  });

  test("tcp section has value and formatted display", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { tcp } = (await res.json()).data;

    expect(tcp).toMatchObject({
      formattedValue: expect.any(String),
    });
    // value can be number or null
    expect(typeof tcp.value === "number" || tcp.value === null).toBe(true);

    if (tcp.value !== null) {
      expect(tcp.formattedValue).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test("health section has status and label", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { health } = (await res.json()).data;

    expect(health).toMatchObject({
      status: expect.stringMatching(
        /^(critical|caution|healthy|not_available)$/
      ),
      label: expect.any(String),
    });
    expect(health.label.length).toBeGreaterThan(0);
  });

  test("health label matches status value", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { health } = (await res.json()).data;

    const expectedLabels: Record<string, string> = {
      critical: "Critical",
      caution: "Caution",
      healthy: "Healthy",
      not_available: "Not Available",
    };

    expect(health.label).toBe(expectedLabels[health.status]);
  });

  test("lastReviewed is a valid ISO timestamp or null", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { lastReviewed } = (await res.json()).data;

    if (lastReviewed !== null) {
      expect(typeof lastReviewed).toBe("string");
      const date = new Date(lastReviewed);
      expect(date.getTime()).not.toBeNaN();
    }
  });

  test("widget response is compact (no projection or detailed metrics)", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const data = (await res.json()).data;

    // Widget should only have tcp, health, lastReviewed — not full dashboard data
    expect(data).not.toHaveProperty("projection");
    expect(data).not.toHaveProperty("netWeeklyCashFlow");
    expect(data).not.toHaveProperty("lastRitual");
  });

  test("returns 400 when franchise param is missing", async ({ request }) => {
    const res = await request.get(BASE);
    expect(res.status()).toBe(400);

    const json = await res.json();
    expect(json.data).toBeNull();
    expect(json.error).toBe("franchise parameter is required");
  });
});
