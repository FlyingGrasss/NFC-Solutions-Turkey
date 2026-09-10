import { requireAdminMember } from "@/lib/auth-helpers";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdminMember();
  return children;
}
