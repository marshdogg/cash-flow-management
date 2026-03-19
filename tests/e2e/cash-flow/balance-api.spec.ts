import { test, expect } from "@playwright/test";

const BASE = "/api/cash-flow/balance";
const FRANCHISE = "fr_toronto_east";

test.describe("Cash Flow Balance API — GET /balance", () => {
  test("returns balance data with envelope structure", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.error).toBeNull();
    expect(json.meta).toMatchObject({ franchiseId: FRANCHISE });
  });

  test("current balance has required fields", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { current } = (await res.json()).data;

    expect(current).toMatchObject({
      id: expect.any(String),
      franchiseId: expect.any(String),
      amount: expect.any(Number),
      recordedAt: expect.any(String),
      recordedBy: expect.any(String),
    });
  });

  test("current balance amount is a valid number", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { current } = (await res.json()).data;

    expect(typeof current.amount).toBe("number");
    expect(Number.isFinite(current.amount)).toBe(true);
  });

  test("current balance recordedAt is a valid ISO timestamp", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { current } = (await res.json()).data;

    const date = new Date(current.recordedAt);
    expect(date.toISOString()).toBe(current.recordedAt);
  });

  test("history is an array of balance entries", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { history } = (await res.json()).data;

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);

    for (const entry of history) {
      expect(entry).toMatchObject({
        amount: expect.any(Number),
        recordedAt: expect.any(String),
      });
    }
  });

  test("history entries are in reverse chronological order", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const { history } = (await res.json()).data;

    for (let i = 1; i < history.length; i++) {
      const prev = new Date(history[i - 1].recordedAt).getTime();
      const curr = new Date(history[i].recordedAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
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
