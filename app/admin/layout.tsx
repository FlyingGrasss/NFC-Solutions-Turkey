import { AdminAccessProvider } from "@/components/admin-access-context";
import { requireMember, requireSession } from "@/lib/auth-helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const member = await requireMember();
  return <AdminAccessProvider role={member.role}><div className="admin-panel-shell" data-admin-panel-shell>{children}</div></AdminAccessProvider>;
}
