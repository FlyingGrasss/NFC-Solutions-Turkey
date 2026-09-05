import type { Member, SaleMode, TransactionType } from "@/generated/prisma/client";

export type FinanceMember = Pick<Member, "id" | "name">;

export type FinanceTransaction = {
  id: string;
  type: TransactionType;
  amountCents: number;
  paidByMemberId: string | null;
  saleMode: SaleMode;
  soldByMemberId: string | null;
};

export type SettlementRecord = {
  amountCents: number;
  fromMemberId: string;
  toMemberId: string;
};

export function getPartnerMembers(members: FinanceMember[]) {
  const preferred = ["Emre", "Başar"]
    .map((name) => members.find((member) => member.name === name))
    .filter((member): member is FinanceMember => Boolean(member));
  return preferred.length === 2 ? preferred : members.slice(0, 2);
}

export type MemberFinanceTotals = {
  soldSoloCents: number;
  soldJointCents: number;
  entitledIncomeCents: number;
  sharedExpenseCents: number;
  actualIncomeCents: number;
  actualExpenseCents: number;
  sentSettlementCents: number;
  receivedSettlementCents: number;
  actualNetCents: number;
  settlementCents: number;
};

export function splitCents(amountCents: number, numerator: number, denominator: number) {
  const primary = Math.floor((amountCents * numerator) / denominator);
  const remainder = amountCents - primary;
  return [primary, remainder] as const;
}

export function calculateFinance(
  members: FinanceMember[],
  transactions: FinanceTransaction[],
  settlements: SettlementRecord[],
) {
  const totals = new Map<string, MemberFinanceTotals>(
    members.map((member) => [member.id, {
      soldSoloCents: 0,
      soldJointCents: 0,
      entitledIncomeCents: 0,
      sharedExpenseCents: 0,
      actualIncomeCents: 0,
      actualExpenseCents: 0,
      sentSettlementCents: 0,
      receivedSettlementCents: 0,
      actualNetCents: 0,
      settlementCents: 0,
    }]),
  );
  const incomeCents = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
  const expenseCents = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);

  for (const transaction of transactions) {
    const isIncome = transaction.type === "INCOME";
    const [firstMember, secondMember] = members;
    if (!firstMember || !secondMember) continue;

    if (isIncome) {
      if (transaction.saleMode === "SOLO" && transaction.soldByMemberId) {
        const seller = totals.get(transaction.soldByMemberId);
        if (seller) {
          seller.soldSoloCents += transaction.amountCents;
          const [sellerShare, otherShare] = splitCents(transaction.amountCents, 2, 3);
          seller.entitledIncomeCents += sellerShare;
          const other = members.find((member) => member.id !== transaction.soldByMemberId);
          if (other) totals.get(other.id)!.entitledIncomeCents += otherShare;
        }
      } else {
        if (transaction.saleMode === "JOINT") {
          const [firstJointShare, secondJointShare] = splitCents(transaction.amountCents, 1, 2);
          totals.get(firstMember.id)!.soldJointCents += firstJointShare;
          totals.get(secondMember.id)!.soldJointCents += secondJointShare;
        }
        const [firstShare, secondShare] = splitCents(transaction.amountCents, 1, 2);
        totals.get(firstMember.id)!.entitledIncomeCents += firstShare;
        totals.get(secondMember.id)!.entitledIncomeCents += secondShare;
      }
    } else {
      const [firstShare, secondShare] = splitCents(transaction.amountCents, 1, 2);
      totals.get(firstMember.id)!.sharedExpenseCents += firstShare;
      totals.get(secondMember.id)!.sharedExpenseCents += secondShare;
    }

    const actualHolder = transaction.paidByMemberId;
    if (actualHolder && totals.has(actualHolder)) {
      const target = totals.get(actualHolder)!;
      if (isIncome) target.actualIncomeCents += transaction.amountCents;
      else target.actualExpenseCents += transaction.amountCents;
    } else {
      const [firstShare, secondShare] = splitCents(transaction.amountCents, 1, 2);
      if (isIncome) {
        totals.get(firstMember.id)!.actualIncomeCents += firstShare;
        totals.get(secondMember.id)!.actualIncomeCents += secondShare;
      } else {
        totals.get(firstMember.id)!.actualExpenseCents += firstShare;
        totals.get(secondMember.id)!.actualExpenseCents += secondShare;
      }
    }
  }

  for (const settlement of settlements) {
    if (totals.has(settlement.fromMemberId)) {
      totals.get(settlement.fromMemberId)!.sentSettlementCents += settlement.amountCents;
    }
    if (totals.has(settlement.toMemberId)) {
      totals.get(settlement.toMemberId)!.receivedSettlementCents += settlement.amountCents;
    }
  }

  for (const total of totals.values()) {
    total.actualNetCents = total.actualIncomeCents - total.actualExpenseCents - total.sentSettlementCents + total.receivedSettlementCents;
    total.settlementCents = total.actualNetCents - (total.entitledIncomeCents - total.sharedExpenseCents);
  }

  return {
    totals,
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  };
}

export function getSettlementSuggestion(
  members: FinanceMember[],
  transactions: FinanceTransaction[],
  settlements: SettlementRecord[],
) {
  const result = calculateFinance(members, transactions, settlements);
  const [firstMember, secondMember] = members;
  if (!firstMember || !secondMember) return null;

  const firstDelta = result.totals.get(firstMember.id)?.settlementCents ?? 0;
  if (firstDelta > 0) {
    return { fromMemberId: firstMember.id, toMemberId: secondMember.id, amountCents: Math.round(firstDelta) };
  }
  if (firstDelta < 0) {
    return { fromMemberId: secondMember.id, toMemberId: firstMember.id, amountCents: Math.round(Math.abs(firstDelta)) };
  }
  return null;
}
