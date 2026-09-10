"use client";

import { createContext, useContext } from "react";
import type { MemberRole } from "@/generated/prisma/client";

const AdminAccessContext = createContext<MemberRole>("ADMIN");
export function AdminAccessProvider({ role, children }: { role: MemberRole; children: React.ReactNode }) { return <AdminAccessContext.Provider value={role}>{children}</AdminAccessContext.Provider>; }
export function useAdminRole() { return useContext(AdminAccessContext); }
