"use client";

import { useActionState, useState } from "react";
import type { ProfileFormState } from "@/app/profile-actions";
import { profileColorSchemes, type ProfileColorScheme } from "@/lib/profile";
import { eyebrowClass, fieldInputClass, fieldLabelClass } from "@/lib/ui";

type ProfileAction = (
  state: ProfileFormState,
  formData: FormData,
) => Promise<ProfileFormState>;

export type EditableProfile = {
  id?: string;
  slug: string;
  imageUrl: string | null;
  showImage: boolean;
  name: string;
  title: string | null;
  title2: string | null;
  colorScheme: ProfileColorScheme;
  iban: string | null;
  ibanEnabled: boolean;
  callNumber: string | null;
  callEnabled: boolean;
  callFullWidth: boolean;
  whatsappNumber: string | null;
  whatsappEnabled: boolean;
  whatsappFullWidth: boolean;
  email: string | null;
  emailEnabled: boolean;
  emailFullWidth: boolean;
  linkedinUrl: string | null;
  linkedinEnabled: boolean;
  linkedinFullWidth: boolean;
  instagramUrl: string | null;
  instagramEnabled: boolean;
  instagramFullWidth: boolean;
  locationUrl: string | null;
  locationEnabled: boolean;
  locationFullWidth: boolean;
  contactEnabled: boolean;
  contactFullWidth: boolean;
  facilitiesHeading: string;
  facilities: Array<{ id?: string; name: string; url: string }>;
};

type FacilityDraft = {
  key: string;
  name: string;
  url: string;
};

function CheckControl({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-emerald-600"
      />
      {label}
    </label>
  );
}

function ButtonSetting({
  label,
  valueName,
  enabledName,
  fullWidthName,
  value,
  enabled,
  fullWidth,
  placeholder,
}: {
  label: string;
  valueName?: string;
  enabledName: string;
  fullWidthName: string;
  value?: string | null;
  enabled: boolean;
  fullWidth: boolean;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-800">{label}</p>
        <div className="flex flex-wrap gap-4">
          <CheckControl name={enabledName} label="Göster" defaultChecked={enabled} />
          <CheckControl
            name={fullWidthName}
            label="Tam genişlik"
            defaultChecked={fullWidth}
          />
        </div>
      </div>
      {valueName ? (
        <input
          name={valueName}
          type="text"
          defaultValue={value ?? ""}
          placeholder={placeholder}
          className={`${fieldInputClass} mt-3`}
        />
      ) : null}
    </div>
  );
}

const emptyProfile: EditableProfile = {
  slug: "",
  imageUrl: null,
  showImage: true,
  name: "",
  title: "",
  title2: null,
  colorScheme: "forest",
  iban: null,
  ibanEnabled: true,
  callNumber: null,
  callEnabled: true,
  callFullWidth: false,
  whatsappNumber: null,
  whatsappEnabled: true,
  whatsappFullWidth: false,
  email: null,
  emailEnabled: true,
  emailFullWidth: false,
  linkedinUrl: null,
  linkedinEnabled: true,
  linkedinFullWidth: false,
  instagramUrl: null,
  instagramEnabled: true,
  instagramFullWidth: false,
  locationUrl: null,
  locationEnabled: true,
  locationFullWidth: true,
  contactEnabled: true,
  contactFullWidth: true,
  facilitiesHeading: "Bağlantılar",
  facilities: [],
};

export function ProfileEditorForm({
  action,
  mode,
  profile = emptyProfile,
}: {
  action: ProfileAction;
  mode: "create" | "master-edit" | "owner-edit";
  profile?: EditableProfile;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [facilities, setFacilities] = useState<FacilityDraft[]>(() =>
    profile.facilities.map((facility, index) => ({
      key: facility.id ?? `initial-${index}`,
      name: facility.name,
      url: facility.url,
    })),
  );

  function updateFacility(index: number, field: "name" | "url", value: string) {
    setFacilities((current) =>
      current.map((facility, facilityIndex) =>
        facilityIndex === index ? { ...facility, [field]: value } : facility,
      ),
    );
  }

  return (
    <form action={formAction} className="space-y-7">
      {profile.id ? <input type="hidden" name="id" value={profile.id} /> : null}
      <input
        type="hidden"
        name="facilities"
        value={JSON.stringify(facilities.map(({ name, url }) => ({ name, url })))}
      />

      <section className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
        <div className="mb-4">
          <p className={eyebrowClass}>Temel bilgiler</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Profil kartı</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-slug" className={fieldLabelClass}>Kısa adres</label>
            {mode === "owner-edit" ? <input type="hidden" name="slug" value={profile.slug} /> : null}
            <input
              id="profile-slug"
              name={mode === "owner-edit" ? undefined : "slug"}
              required={mode !== "owner-edit"}
              disabled={mode === "owner-edit"}
              defaultValue={profile.slug}
              placeholder="ahmet-yazici"
              className={`${fieldInputClass} disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400`}
            />
            <p className="mt-1 text-xs text-slate-400">
              /slug adresinin son parçası. {mode === "owner-edit" ? "Yalnızca ana admin panelinden değiştirilebilir." : null}
            </p>
          </div>
          {mode !== "owner-edit" ? (
            <div>
              <label htmlFor="profile-password" className={fieldLabelClass}>
                {mode === "create" ? "Profil şifresi" : "Yeni profil şifresi (opsiyonel)"}
              </label>
              <input
                id="profile-password"
                name="password"
                type="password"
                required={mode === "create"}
                autoComplete={mode === "create" ? "new-password" : "off"}
                placeholder={mode === "create" ? "En az 6 karakter" : "Değiştirmeyeceksen boş bırak"}
                className={fieldInputClass}
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="profile-name" className={fieldLabelClass}>İsim</label>
            <input id="profile-name" name="name" required defaultValue={profile.name} className={fieldInputClass} />
          </div>
          <div>
            <label htmlFor="profile-title" className={fieldLabelClass}>Başlık (opsiyonel)</label>
            <input id="profile-title" name="title" defaultValue={profile.title ?? ""} placeholder="Satın Alma Müdürü" className={fieldInputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-title2" className={fieldLabelClass}>İkinci başlık (opsiyonel)</label>
            <input id="profile-title2" name="title2" defaultValue={profile.title2 ?? ""} placeholder="Purchasing Manager" className={fieldInputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-image" className={fieldLabelClass}>Görsel bağlantısı (opsiyonel)</label>
            <input id="profile-image" name="imageUrl" type="url" defaultValue={profile.imageUrl ?? ""} placeholder="https://..." className={fieldInputClass} />
            <div className="mt-2">
              <CheckControl name="showImage" label="Görseli göster" defaultChecked={profile.showImage} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
        <div className="mb-4">
          <p className={eyebrowClass}>Görünüm</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Renk teması</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Profil sayfası için hazır temalardan birini seç.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profileColorSchemes.map((scheme) => (
            <label key={scheme.value} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="colorScheme"
                value={scheme.value}
                defaultChecked={profile.colorScheme === scheme.value}
              />
              <span className="h-10 w-10 shrink-0 rounded-xl" style={{ background: { forest: "linear-gradient(135deg,#071512,#2c7950)", midnight: "linear-gradient(135deg,#071321,#3c6eaa)", ocean: "linear-gradient(135deg,#06161b,#1d9bb2)", sand: "linear-gradient(135deg,#20170e,#bf8246)", plum: "linear-gradient(135deg,#1b0c1c,#a65db2)" }[scheme.value] }} />
              <span className="min-w-0">
                <strong className="block text-sm font-extrabold text-slate-800">{scheme.label}</strong>
                <small className="mt-0.5 block text-xs text-slate-400">{scheme.description}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 pt-6">
        <div className="mb-4">
          <p className={eyebrowClass}>İletişim kartları</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Butonlar</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Göster seçimi butonu açar; tam genişlik seçimi mobilde butonu tek satıra taşır.</p>
        </div>
        <div className="grid gap-3">
          <ButtonSetting label="Ara" valueName="callNumber" enabledName="callEnabled" fullWidthName="callFullWidth" value={profile.callNumber} enabled={profile.callEnabled} fullWidth={profile.callFullWidth} placeholder="+90 5xx xxx xx xx" />
          <ButtonSetting label="WhatsApp" valueName="whatsappNumber" enabledName="whatsappEnabled" fullWidthName="whatsappFullWidth" value={profile.whatsappNumber} enabled={profile.whatsappEnabled} fullWidth={profile.whatsappFullWidth} placeholder="905xx xxx xx xx" />
          <ButtonSetting label="Mail" valueName="email" enabledName="emailEnabled" fullWidthName="emailFullWidth" value={profile.email} enabled={profile.emailEnabled} fullWidth={profile.emailFullWidth} placeholder="isim@firma.com" />
          <ButtonSetting label="LinkedIn" valueName="linkedinUrl" enabledName="linkedinEnabled" fullWidthName="linkedinFullWidth" value={profile.linkedinUrl} enabled={profile.linkedinEnabled} fullWidth={profile.linkedinFullWidth} placeholder="https://linkedin.com/in/..." />
          <ButtonSetting label="Instagram" valueName="instagramUrl" enabledName="instagramEnabled" fullWidthName="instagramFullWidth" value={profile.instagramUrl} enabled={profile.instagramEnabled} fullWidth={profile.instagramFullWidth} placeholder="https://instagram.com/..." />
          <ButtonSetting label="Konum" valueName="locationUrl" enabledName="locationEnabled" fullWidthName="locationFullWidth" value={profile.locationUrl} enabled={profile.locationEnabled} fullWidth={profile.locationFullWidth} placeholder="https://maps.google.com/..." />
          <ButtonSetting label="Kişilere Ekle" enabledName="contactEnabled" fullWidthName="contactFullWidth" enabled={profile.contactEnabled} fullWidth={profile.contactFullWidth} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-800">IBAN</p>
              <CheckControl name="ibanEnabled" label="Göster" defaultChecked={profile.ibanEnabled} />
            </div>
            <input
              name="iban"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              defaultValue={profile.iban ?? ""}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className={`${fieldInputClass} mt-3 uppercase`}
            />
            <p className="mt-2 text-xs leading-5 text-slate-400">Profilde mobil uyumlu bir kopyalama kartı olarak gösterilir.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 pt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Alt bölüm</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Bağlantılar</h2>
          </div>
          <button
            type="button"
            onClick={() => setFacilities((current) => [...current, { key: crypto.randomUUID(), name: "", url: "" }])}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
          >
            + Bağlantı ekle
          </button>
        </div>
        <label htmlFor="facilities-heading" className={fieldLabelClass}>Bağlantılar bölüm başlığı</label>
        <input id="facilities-heading" name="facilitiesHeading" defaultValue={profile.facilitiesHeading} className={fieldInputClass} />
        <div className="mt-4 grid gap-3">
          {facilities.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-400">Henüz bağlantı eklenmedi.</p>
          ) : null}
          {facilities.map((facility, index) => (
            <div key={facility.key} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1.3fr_auto] sm:items-end">
              <div>
                <label htmlFor={`facility-name-${index}`} className={fieldLabelClass}>Bağlantı adı</label>
                <input id={`facility-name-${index}`} value={facility.name} onChange={(event) => updateFacility(index, "name", event.target.value)} className={fieldInputClass} placeholder="İsim" />
              </div>
              <div>
                <label htmlFor={`facility-url-${index}`} className={fieldLabelClass}>Bağlantı</label>
                <input id={`facility-url-${index}`} value={facility.url} onChange={(event) => updateFacility(index, "url", event.target.value)} className={fieldInputClass} placeholder="https://..." />
              </div>
              <button type="button" onClick={() => setFacilities((current) => current.filter((_, facilityIndex) => facilityIndex !== index))} className="rounded-xl px-3 py-3 text-sm font-bold text-rose-500 transition hover:bg-rose-50">Kaldır</button>
            </div>
          ))}
        </div>
      </section>

      {state.error ? <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{state.error}</p> : null}
      {state.success ? <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{state.success}</p> : null}

      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">
        {pending ? "Kaydediliyor…" : mode === "create" ? "Profili oluştur" : "Değişiklikleri kaydet"}
      </button>
    </form>
  );
}
