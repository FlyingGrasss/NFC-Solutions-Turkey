import assert from "node:assert/strict";
import test from "node:test";
import { calculateFinance, getSettlementSuggestion, type FinanceMember, type FinanceTransaction } from "@/lib/finance";

const members: FinanceMember[] = [
  { id: "emre", name: "Emre" },
  { id: "basar", name: "Başar" },
];

function income(amountCents: number, saleMode: FinanceTransaction["saleMode"], soldByMemberId: string | null, paidByMemberId: string | null): FinanceTransaction {
  return { id: crypto.randomUUID(), type: "INCOME", amountCents, saleMode, soldByMemberId, paidByMemberId };
}

function expense(amountCents: number, paidByMemberId: string | null): FinanceTransaction {
  return { id: crypto.randomUUID(), type: "EXPENSE", amountCents, saleMode: "UNASSIGNED", soldByMemberId: null, paidByMemberId };
}

test("solo ciro 2:1 hesaplanır ve eşitleme önerisi satış sahibinden çıkar", () => {
  const transactions = [income(90_000, "SOLO", "emre", "emre")];
  const result = calculateFinance(members, transactions, []);
  assert.equal(result.totals.get("emre")?.soldSoloCents, 90_000);
  assert.equal(result.totals.get("emre")?.entitledIncomeCents, 60_000);
  assert.equal(result.totals.get("basar")?.entitledIncomeCents, 30_000);
  assert.deepEqual(getSettlementSuggestion(members, transactions, []), { fromMemberId: "emre", toMemberId: "basar", amountCents: 30_000 });
});

test("birlikte satış 1:1, fiziksel alıcıdan bağımsız hak ediş üretir", () => {
  const transactions = [income(90_001, "JOINT", null, "emre")];
  const result = calculateFinance(members, transactions, []);
  assert.equal(result.totals.get("emre")?.soldJointCents, 45_000);
  assert.equal(result.totals.get("basar")?.soldJointCents, 45_001);
  assert.equal(result.totals.get("emre")?.entitledIncomeCents, 45_000);
  assert.equal(result.totals.get("basar")?.entitledIncomeCents, 45_001);
});

test("ortak gider yarı yarıya düşer ve eşitleme transferi sonucu sıfırlar", () => {
  const transactions = [income(100_000, "JOINT", null, "basar"), expense(20_000, "emre")];
  const before = calculateFinance(members, transactions, []);
  assert.equal(before.totals.get("emre")?.settlementCents, -60_000);
  assert.equal(before.totals.get("basar")?.settlementCents, 60_000);
  const after = calculateFinance(members, transactions, [{ amountCents: 60_000, fromMemberId: "basar", toMemberId: "emre" }]);
  assert.equal(after.totals.get("emre")?.settlementCents, 0);
  assert.equal(after.totals.get("basar")?.settlementCents, 0);
});

test("eski satıcı atanmamış kayıtlar performansa girmez ama finans hesabında eşit kalır", () => {
  const result = calculateFinance(members, [income(10_000, "UNASSIGNED", null, "emre")], []);
  assert.equal(result.totals.get("emre")?.soldSoloCents, 0);
  assert.equal(result.totals.get("basar")?.soldSoloCents, 0);
  assert.equal(result.totals.get("emre")?.entitledIncomeCents, 5_000);
  assert.equal(result.totals.get("basar")?.entitledIncomeCents, 5_000);
});
