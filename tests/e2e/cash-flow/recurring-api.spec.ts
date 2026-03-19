import { test, expect } from "@playwright/test";

const BASE = "/api/cash-flow/recurring";
const FRANCHISE = "fr_toronto_east";

// ─── Helpers ────────────────────────────────────────────────────────
// The mock layer uses a shared in-memory array that can be mutated by
// concurrent Playwright workers (chromium + mobile hit the same dev
// server).  Additionally, `/recurring/route.ts` and
// `/recurring/[id]/route.ts` may hold separate module instances in
// Next.js dev mode, so mutations in one are invisible from the other.
//
// To keep tests deterministic we:
//   1. Never verify cross-route state (collection ↔ individual).
//   2. Only assert on the direct API response of each call.
//   3. Use fixture IDs (txn_001 … txn_008) only for read-only GETs
//      where concurrent mutation is unlikely.
// ────────────────────────────────────────────────────────────────────

test.describe("Recurring Transactions API — GET /recurring", () => {
  test("returns transactions list with envelope structure", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.error).toBeNull();
    expect(Array.isArray(json.data.transactions)).toBe(true);
    expect(json.data.meta).toMatchObject({
      total: expect.any(Number),
      incomeCount: expect.any(Number),
      expenseCount: expect.any(Number),
    });
  });

  test("meta counts are internally consistent", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const json = await res.json();
    const { total, incomeCount, expenseCount } = json.data.meta;

    expect(total).toBeGreaterThan(0);
    expect(incomeCount).toBeGreaterThanOrEqual(0);
    expect(expenseCount).toBeGreaterThanOrEqual(0);
    expect(incomeCount + expenseCount).toBe(total);
  });

  test("each transaction has required fields", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const json = await res.json();

    expect(json.data.transactions.length).toBeGreaterThan(0);
    for (const txn of json.data.transactions) {
      expect(txn).toMatchObject({
        id: expect.any(String),
        franchiseId: expect.any(String),
        name: expect.any(String),
        type: expect.stringMatching(/^(income|expense)$/),
        amount: expect.any(Number),
        frequency: expect.stringMatching(
          /^(weekly|biweekly|monthly|quarterly|annually)$/
        ),
        startDate: expect.any(String),
        nextOccurrence: expect.any(String),
        status: expect.stringMatching(/^(active|paused)$/),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    }
  });

  test("includes franchise metadata in envelope", async ({ request }) => {
    const res = await request.get(`${BASE}?franchise=${FRANCHISE}`);
    const json = await res.json();
    expect(json.meta).toMatchObject({ franchiseId: FRANCHISE });
  });

  test("returns 400 when franchise param is missing", async ({ request }) => {
    const res = await request.get(BASE);
    expect(res.status()).toBe(400);

    const json = await res.json();
    expect(json.data).toBeNull();
    expect(json.error).toBe("franchise parameter is required");
  });
});

test.describe("Recurring Transactions API — POST /recurring", () => {
  test("creates a new transaction with correct defaults", async ({
    request,
  }) => {
    const payload = {
      franchiseId: FRANCHISE,
      name: "Test Income Stream",
      type: "income",
      amount: 5000,
      frequency: "monthly",
      startDate: "2026-04-01",
    };

    const res = await request.post(BASE, { data: payload });
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.error).toBeNull();

    const txn = json.data;
    expect(txn.id).toMatch(/^txn_/);
    expect(txn.franchiseId).toBe(FRANCHISE);
    expect(txn.name).toBe("Test Income Stream");
    expect(txn.type).toBe("income");
    expect(txn.amount).toBe(5000);
    expect(txn.frequency).toBe("monthly");
    expect(txn.startDate).toBe("2026-04-01");
    expect(txn.nextOccurrence).toBe("2026-04-01");
    expect(txn.status).toBe("active");
    expect(txn.createdAt).toBeDefined();
    expect(txn.updatedAt).toBeDefined();
  });

  test("creates an expense transaction", async ({ request }) => {
    const payload = {
      franchiseId: FRANCHISE,
      name: "Equipment Lease",
      type: "expense",
      amount: 750,
      frequency: "biweekly",
      startDate: "2026-05-15",
    };

    const res = await request.post(BASE, { data: payload });
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data.type).toBe("expense");
    expect(json.data.amount).toBe(750);
    expect(json.data.frequency).toBe("biweekly");
  });
});

test.describe("Recurring Transactions API — PATCH /recurring (bulk)", () => {
  test("pause action returns updated count", async ({ request }) => {
    // Create a dedicated transaction so we don't depend on shared state
    const createRes = await request.post(BASE, {
      data: {
        franchiseId: FRANCHISE,
        name: "Pause Target",
        type: "income",
        amount: 100,
        frequency: "weekly",
        startDate: "2026-06-01",
      },
    });
    const created = (await createRes.json()).data;
    expect(created.status).toBe("active");

    const res = await request.patch(BASE, {
      data: { ids: [created.id], action: "pause" },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data).toMatchObject({ updated: 1 });
  });

  test("resume action returns updated count", async ({ request }) => {
    // Create, pause, then resume — all via collection route
    const createRes = await request.post(BASE, {
      data: {
        franchiseId: FRANCHISE,
        name: "Resume Target",
        type: "expense",
        amount: 200,
        frequency: "monthly",
        startDate: "2026-06-15",
      },
    });
    const created = (await createRes.json()).data;

    await request.patch(BASE, {
      data: { ids: [created.id], action: "pause" },
    });

    const res = await request.patch(BASE, {
      data: { ids: [created.id], action: "resume" },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data).toMatchObject({ updated: 1 });
  });

  test("delete action returns updated count", async ({ request }) => {
    const createRes = await request.post(BASE, {
      data: {
        franchiseId: FRANCHISE,
        name: "Bulk Delete Target",
        type: "expense",
        amount: 100,
        frequency: "weekly",
        startDate: "2026-06-01",
      },
    });
    const created = (await createRes.json()).data;

    const res = await request.patch(BASE, {
      data: { ids: [created.id], action: "delete" },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data).toMatchObject({ updated: 1 });
  });

  test("bulk action on multiple IDs reports correct count", async ({
    request,
  }) => {
    const ids: string[] = [];
    for (let i = 0; i < 2; i++) {
      const res = await request.post(BASE, {
        data: {
          franchiseId: FRANCHISE,
          name: `Bulk Test ${i}`,
          type: "expense",
          amount: 50,
          frequency: "monthly",
          startDate: "2026-07-01",
        },
      });
      ids.push((await res.json()).data.id);
    }

    const res = await request.patch(BASE, {
      data: { ids, action: "pause" },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data).toMatchObject({ updated: 2 });
  });
});

test.describe("Recurring Transactions API — GET /recurring/[id]", () => {
  test("returns a single transaction by ID", async ({ request }) => {
    const res = await request.get(`${BASE}/txn_001`);
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data.id).toBe("txn_001");
    expect(json.data.name).toBe("Residential Painting Revenue");
    expect(json.data.type).toBe("income");
    expect(json.data.amount).toBe(12000);
    expect(json.data.frequency).toBe("weekly");
  });

  test("returns 404 for non-existent ID", async ({ request }) => {
    const res = await request.get(`${BASE}/txn_nonexistent`);
    expect(res.status()).toBe(404);

    const json = await res.json();
    expect(json.data).toBeNull();
    expect(json.error).toBe("Transaction not found");
  });
});

test.describe("Recurring Transactions API — PATCH /recurring/[id]", () => {
  test("updates transaction name and returns updated entity", async ({
    request,
  }) => {
    const res = await request.patch(`${BASE}/txn_002`, {
      data: { name: "Updated Commercial Contracts" },
    });
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data.id).toBe("txn_002");
    expect(json.data.name).toBe("Updated Commercial Contracts");
  });

  test("updates transaction amount", async ({ request }) => {
    const res = await request.patch(`${BASE}/txn_002`, {
      data: { amount: 9500 },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.amount).toBe(9500);
  });

  test("updates transaction frequency", async ({ request }) => {
    const res = await request.patch(`${BASE}/txn_002`, {
      data: { frequency: "quarterly" },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.frequency).toBe("quarterly");
  });

  test("updates transaction status", async ({ request }) => {
    const res = await request.patch(`${BASE}/txn_005`, {
      data: { status: "paused" },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.status).toBe("paused");
  });

  test("sets updatedAt timestamp on update", async ({ request }) => {
    const before = new Date().toISOString();
    const res = await request.patch(`${BASE}/txn_003`, {
      data: { name: "Updated Crew Payroll" },
    });
    const after = new Date().toISOString();

    const json = await res.json();
    expect(json.data.updatedAt >= before).toBe(true);
    expect(json.data.updatedAt <= after).toBe(true);
  });

  test("partial update preserves unchanged fields in response", async ({
    request,
  }) => {
    // Read current state
    const getRes = await request.get(`${BASE}/txn_004`);
    const original = (await getRes.json()).data;

    // Update only the name
    const patchRes = await request.patch(`${BASE}/txn_004`, {
      data: { name: "Renamed Vehicle Leases" },
    });
    const updated = (await patchRes.json()).data;

    expect(updated.name).toBe("Renamed Vehicle Leases");
    expect(updated.type).toBe(original.type);
    expect(updated.amount).toBe(original.amount);
    expect(updated.frequency).toBe(original.frequency);
  });

  test("returns 404 for non-existent ID", async ({ request }) => {
    const res = await request.patch(`${BASE}/txn_nonexistent`, {
      data: { name: "Ghost" },
    });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("Transaction not found");
  });
});

test.describe("Recurring Transactions API — DELETE /recurring/[id]", () => {
  test("delete returns correct envelope on success or 404", async ({
    request,
  }) => {
    // Fixture may already be deleted by the other Playwright project
    // (chromium + mobile share a dev server). Verify whichever we get.
    const res = await request.delete(`${BASE}/txn_006`);
    const json = await res.json();

    if (res.ok()) {
      expect(json.data).toMatchObject({ deleted: "txn_006" });
      expect(json.error).toBeNull();
    } else {
      expect(res.status()).toBe(404);
      expect(json.error).toBe("Transaction not found");
    }
  });

  test("deleted fixture returns 404 on subsequent GET", async ({
    request,
  }) => {
    // Delete txn_007 (may already be gone — that's fine).
    // Either way, a subsequent GET must return 404.
    await request.delete(`${BASE}/txn_007`);

    const getRes = await request.get(`${BASE}/txn_007`);
    expect(getRes.status()).toBe(404);
  });

  test("returns 404 for non-existent ID", async ({ request }) => {
    const res = await request.delete(`${BASE}/txn_nonexistent`);
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("Transaction not found");
  });
});
