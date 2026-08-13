import { signOutAction } from "@/app/actions";

export function AdminLogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
      >
        Çıkış yap
      </button>
    </form>
  );
}
