import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentMember, getCurrentSession } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Giriş | Gelir Gider",
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  const [session, member] = await Promise.all([
    getCurrentSession(),
    getCurrentMember(),
  ]);

  if (session && member) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#dcefe2_0,transparent_35%),#f4f7f5] p-5">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200/75 bg-white/90 p-8 shadow-[0_24px_70px_rgb(25_55_36_/_0.1)] backdrop-blur-xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-700">₺</div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Gelir Gider</p>
            <p className="text-xs text-slate-400">İki kişi, tek düzen</p>
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Hoş geldiniz
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Adınızı ve şifrenizi girin; kayıtların yanında adınız görünsün.
        </p>

        <LoginForm defaultName={member?.name} />
      </div>
    </main>
  );
}
