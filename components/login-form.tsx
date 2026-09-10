"use client";

import { useActionState } from "react";
import { signInAction, type LoginState } from "@/app/actions";

const initialState: LoginState = {};

export function LoginForm({ defaultName = "" }: { defaultName?: string }) {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Adınız
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={40}
          defaultValue={defaultName}
          autoFocus
          className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          placeholder="Örn. Emre"
        />
        <p className="mt-2 text-xs text-slate-400">
          Kayıtların yanında görünecek.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          placeholder="Şifrenizi girin"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-13 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>

      <p className="text-center text-xs leading-5 text-slate-400">
        Bu cihazda oturumunuz açık kalır.
      </p>
    </form>
  );
}
