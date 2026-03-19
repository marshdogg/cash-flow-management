import { test, expect } from "@playwright/test";

const BASE = "/api/cash-flow/ritual";

test.describe("Cash Flow Ritual API — POST /ritual", () => {
  test("completes a ritual and returns snapshot envelope", async ({
    request,
  }) => {
    const payload = {
      bankBalance: 52000,
      oneOffTransactions: [],
    };

    const res = await request.post(BASE, { data: payload });
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.error).toBeNull();
  });

  test("response contains snapshot with required fields", async ({
    request,
  }) => {
    const res = await request.post(BASE, {
      data: { bankBalance: 50000, oneOffTransactions: [] },
    });
    const { snapshot } = (await res.json()).data;

    expect(snapshot).toMatchObject({
      id: expect.stringMatching(/^snap_/),
      franchiseId: expect.any(String),
      bankBalance: expect.any(Number),
      tcp: expect.any(Number),
      netWeeklyCashFlow: expect.any(Number),
      healthStatus: expect.stringMatching(
        /^(critical|caution|healthy|not_available)$/
      ),
      completedAt: expect.any(String),
      completedBy: expect.any(String),
    });
    // weeksOfRunway can be number or null
    expect(
      typeof snapshot.weeksOfRunway === "number" ||
        snapshot.weeksOfRunway === null
    ).toBe(true);
  });

  test("response contains success message", async ({ request }) => {
    const res = await request.post(BASE, {
      data: { bankBalance: 48000, oneOffTransactions: [] },
    });
    const json = await res.json();
    expect(json.data.message).toBe("Ritual completed successfully");
  });

  test("snapshot reflects submitted bank balance", async ({ request }) => {
    const submittedBalance = 67500;
    const res = await request.post(BASE, {
      data: { bankBalance: submittedBalance, oneOffTransactions: [] },
    });
    const { snapshot } = (await res.json()).data;
    expect(snapshot.bankBalance).toBe(submittedBalance);
  });

  test("snapshot gets a unique ID per completion", async ({ request }) => {
    const payload = { bankBalance: 40000, oneOffTransactions: [] };

    const res1 = await request.post(BASE, { data: payload });
    const id1 = (await res1.json()).data.snapshot.id;

    const res2 = await request.post(BASE, { data: payload });
    const id2 = (await res2.json()).data.snapshot.id;

    expect(id1).not.toBe(id2);
  });

  test("snapshot completedAt is a recent ISO timestamp", async ({
    request,
  }) => {
    const before = new Date().toISOString();
    const res = await request.post(BASE, {
      data: { bankBalance: 45000, oneOffTransactions: [] },
    });
    const after = new Date().toISOString();

    const { snapshot } = (await res.json()).data;
    expect(snapshot.completedAt >= before).toBe(true);
    expect(snapshot.completedAt <= after).toBe(true);
  });

  test("accepts one-off transactions in the request body", async ({
    request,
  }) => {
    const payload = {
      bankBalance: 55000,
      oneOffTransactions: [
        { description: "Equipment sale", amount: 3000, type: "income" },
        { description: "Emergency repair", amount: 1200, type: "expense" },
      ],
    };

    const res = await request.post(BASE, { data: payload });
    expect(res.ok()).toBe(true);

    const json = await res.json();
    expect(json.data.snapshot).toBeDefined();
    expect(json.data.message).toBe("Ritual completed successfully");
  });

  test("works with zero bank balance", async ({ request }) => {
    const res = await request.post(BASE, {
      data: { bankBalance: 0, oneOffTransactions: [] },
    });
    expect(res.ok()).toBe(true);

    const { snapshot } = (await res.json()).data;
    expect(snapshot.bankBalance).toBe(0);
  });
});
