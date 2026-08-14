import {
  normalizeEmail,
  isValidIban,
  normalizeHttpUrl,
  normalizeIban,
  normalizeSlug,
  normalizeProfileColorScheme,
  type ProfileFacilityInput,
} from "@/lib/profile";
import { defaultProfileButtonOrder, normalizeProfileButtonOrder } from "@/lib/profile-buttons";

type ParseResult<T> = { value: T } | { error: string };

export type ProfileCustomButtonInput = {
  key: string;
  label: string;
  url: string;
  fullWidth: boolean;
};

export type ProfileFields = {
  slug: string;
  imageUrl: string | null;
  showImage: boolean;
  name: string;
  title: string | null;
  title2: string | null;
  colorScheme: ReturnType<typeof normalizeProfileColorScheme>;
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
  telegramUrl: string | null;
  telegramEnabled: boolean;
  telegramFullWidth: boolean;
  contactEnabled: boolean;
  contactFullWidth: boolean;
  buttonOrder: string[];
  customButtons: ProfileCustomButtonInput[];
  facilitiesHeading: string;
  facilities: ProfileFacilityInput[];
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function optionalUrl(formData: FormData, name: string, label: string): ParseResult<string | null> {
  const value = textValue(formData, name);
  const url = normalizeHttpUrl(value);

  if (value && !url) {
    return { error: `${label} için http(s) bağlantısı girin.` };
  }

  return { value: url };
}

function parseFacilities(formData: FormData): ParseResult<ProfileFacilityInput[]> {
  const value = formData.get("facilities");

  if (typeof value !== "string" || !value.trim()) {
    return { value: [] };
  }

  let rows: unknown;

  try {
    rows = JSON.parse(value);
  } catch {
    return { error: "Bağlantılar okunamadı." };
  }

  if (!Array.isArray(rows)) {
    return { error: "Bağlantılar geçersiz." };
  }

  const facilities: ProfileFacilityInput[] = [];

  for (const row of rows.slice(0, 30)) {
    if (!row || typeof row !== "object") {
      return { error: "Bağlantılar geçersiz." } as const;
    }

    const record = row as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const rawUrl = typeof record.url === "string" ? record.url.trim() : "";

    if (!name && !rawUrl) {
      continue;
    }

    const url = normalizeHttpUrl(rawUrl);

    if (!name || !url) {
      return { error: "Her bağlantı için ad ve geçerli bir URL girin." };
    }

    facilities.push({
      name: name.slice(0, 100),
      url,
    });
  }

  return { value: facilities };
}

function parseCustomButtons(formData: FormData): ParseResult<ProfileCustomButtonInput[]> {
  const value = formData.get("customButtons");

  if (typeof value !== "string" || !value.trim()) {
    return { value: [] };
  }

  let rows: unknown;

  try {
    rows = JSON.parse(value);
  } catch {
    return { error: "Özel butonlar okunamadı." };
  }

  if (!Array.isArray(rows)) {
    return { error: "Özel butonlar geçersiz." };
  }

  const buttons: ProfileCustomButtonInput[] = [];
  const keys = new Set<string>();

  for (const row of rows.slice(0, 30)) {
    if (!row || typeof row !== "object") {
      return { error: "Özel butonlar geçersiz." };
    }

    const record = row as Record<string, unknown>;
    const key = typeof record.key === "string" ? record.key.trim() : "";
    const label = typeof record.label === "string" ? record.label.trim().slice(0, 80) : "";
    const rawUrl = typeof record.url === "string" ? record.url.trim() : "";
    const url = normalizeHttpUrl(rawUrl);

    if (
      !key ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(key) ||
      keys.has(key) ||
      defaultProfileButtonOrder.includes(key as (typeof defaultProfileButtonOrder)[number])
    ) {
      return { error: "Özel buton anahtarı geçersiz." };
    }

    if (!label || !url) {
      return { error: "Her özel buton için ad ve geçerli bir URL girin." };
    }

    keys.add(key);
    buttons.push({
      key,
      label,
      url,
      fullWidth: record.fullWidth === true,
    });
  }

  return { value: buttons };
}

export function parseProfileFields(formData: FormData): ParseResult<ProfileFields> {
  const slug = normalizeSlug(textValue(formData, "slug"));
  const name = textValue(formData, "name").slice(0, 120);
  const title = textValue(formData, "title").slice(0, 120) || null;
  const title2 = textValue(formData, "title2").slice(0, 120) || null;
  const ibanInput = textValue(formData, "iban");
  const iban = normalizeIban(ibanInput);
  const facilitiesHeading =
    textValue(formData, "facilitiesHeading").slice(0, 80) || "Bağlantılar";

  if (!slug || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return { error: "Slug sadece küçük harf, rakam ve tire içerebilir." };
  }

  if (!name) {
    return { error: "İsim zorunludur." };
  }

  if (ibanInput && (!iban || !isValidIban(iban))) {
    return { error: "Geçerli bir IBAN girin." };
  }

  const image = optionalUrl(formData, "imageUrl", "Görsel");
  const linkedin = optionalUrl(formData, "linkedinUrl", "LinkedIn");
  const instagram = optionalUrl(formData, "instagramUrl", "Instagram");
  const location = optionalUrl(formData, "locationUrl", "Konum");
  const telegram = optionalUrl(formData, "telegramUrl", "Telegram");
  const facilities = parseFacilities(formData);
  const customButtons = parseCustomButtons(formData);

  if ("error" in image) return image;
  if ("error" in linkedin) return linkedin;
  if ("error" in instagram) return instagram;
  if ("error" in location) return location;
  if ("error" in telegram) return telegram;
  if ("error" in facilities) return facilities;
  if ("error" in customButtons) return customButtons;

  const buttonOrder = normalizeProfileButtonOrder(
    textValue(formData, "buttonOrder"),
    customButtons.value.map((button) => button.key),
  );

  const emailValue = textValue(formData, "email");
  const email = normalizeEmail(emailValue);

  if (emailValue && !email) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }

  return {
    value: {
      slug,
      imageUrl: image.value,
      showImage: checkboxValue(formData, "showImage"),
      name,
      title,
      title2,
      colorScheme: normalizeProfileColorScheme(textValue(formData, "colorScheme")),
      iban,
      ibanEnabled: checkboxValue(formData, "ibanEnabled"),
      callNumber: textValue(formData, "callNumber").slice(0, 40) || null,
      callEnabled: checkboxValue(formData, "callEnabled"),
      callFullWidth: checkboxValue(formData, "callFullWidth"),
      whatsappNumber: textValue(formData, "whatsappNumber").slice(0, 40) || null,
      whatsappEnabled: checkboxValue(formData, "whatsappEnabled"),
      whatsappFullWidth: checkboxValue(formData, "whatsappFullWidth"),
      email,
      emailEnabled: checkboxValue(formData, "emailEnabled"),
      emailFullWidth: checkboxValue(formData, "emailFullWidth"),
      linkedinUrl: linkedin.value,
      linkedinEnabled: checkboxValue(formData, "linkedinEnabled"),
      linkedinFullWidth: checkboxValue(formData, "linkedinFullWidth"),
      instagramUrl: instagram.value,
      instagramEnabled: checkboxValue(formData, "instagramEnabled"),
      instagramFullWidth: checkboxValue(formData, "instagramFullWidth"),
      locationUrl: location.value,
      locationEnabled: checkboxValue(formData, "locationEnabled"),
      locationFullWidth: checkboxValue(formData, "locationFullWidth"),
      telegramUrl: telegram.value,
      telegramEnabled: checkboxValue(formData, "telegramEnabled"),
      telegramFullWidth: checkboxValue(formData, "telegramFullWidth"),
      contactEnabled: checkboxValue(formData, "contactEnabled"),
      contactFullWidth: checkboxValue(formData, "contactFullWidth"),
      buttonOrder,
      customButtons: customButtons.value,
      facilitiesHeading,
      facilities: facilities.value,
    },
  };
}
