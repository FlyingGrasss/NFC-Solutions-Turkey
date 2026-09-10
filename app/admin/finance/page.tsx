import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header"; import { AdminLogoutButton } from "@/components/admin-logout-button"; import { AdminNav } from "@/components/admin-nav";
import { FinanceAnalyticsPanel } from "@/components/admin-finance-panel"; import { ColdWalkInAnalytics } from "@/components/cold-walk-in-analytics";
import { requireAdminMember, requireSession } from "@/lib/auth-helpers"; import { prisma } from "@/lib/db"; import { getPartnerMembers } from "@/lib/finance";
export const metadata: Metadata = { title: "Finans analizi | Yönetim", robots: { index: false, follow: false } };
export default async function FinancePage() {
 const session=await requireSession(); await requireAdminMember();
 const [transactions,settlements,allMembers,walkIns]=await Promise.all([
  prisma.transaction.findMany({where:{userId:session.user.id},include:{paidByMember:{select:{name:true}},soldByMember:{select:{name:true}},sellerCredits:{include:{member:{select:{name:true}}}}},orderBy:[{date:"desc"},{createdAt:"desc"}]}),
  prisma.settlement.findMany({where:{userId:session.user.id},include:{fromMember:{select:{name:true}},toMember:{select:{name:true}}},orderBy:[{date:"desc"},{createdAt:"desc"}],take:50}),
  prisma.member.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
  prisma.lead.findMany({where:{userId:session.user.id,source:"COLD_WALK_IN"},select:{wasSold:true,participants:{select:{memberId:true}}}})
 ]); const members=getPartnerMembers(allMembers);
 const financeTransactions=transactions.map((item)=>({id:item.id,type:item.type,amountCents:item.amountCents,description:item.description,date:item.date.toISOString(),createdByName:item.createdByName,createdByMemberId:item.createdByMemberId,paidByMemberId:item.paidByMemberId,paidByName:item.paidByMember?.name??null,saleMode:item.saleMode,soldByMemberId:item.soldByMemberId,soldByName:item.soldByMember?.name??null,leadId:item.leadId,sellerCredits:item.sellerCredits.map((credit)=>({memberId:credit.memberId,name:credit.member.name}))}));
 return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Finans" title="Analiz ve eşitleme" description="Satış, kayıt, hak ediş ve gerçek para hareketlerini karşılaştır."><AdminLogoutButton/></AdminHeader><AdminNav active="finance"/><FinanceAnalyticsPanel members={members} transactions={financeTransactions} settlements={settlements.map((item)=>({id:item.id,amountCents:item.amountCents,date:item.date.toISOString(),note:item.note,createdByName:item.createdByName,fromMember:item.fromMember,toMember:item.toMember,fromMemberId:item.fromMemberId,toMemberId:item.toMemberId}))}/><ColdWalkInAnalytics members={allMembers} walkIns={walkIns.map((item)=>({wasSold:item.wasSold,participantIds:item.participants.map((p)=>p.memberId)}))}/></div></main>;
}
