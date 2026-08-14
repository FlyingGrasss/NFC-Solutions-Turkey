import {
  normalizeEmail,
  isValidIban,
  normalizeHttpUrl,
  normalizeIban,
  normalizeSlug,
  normalizeProfileColorScheme,
  type ProfileFacilityInput,
} from "@/lib/profile";

type ParseResult<T> = { value: T } | { error: string };

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
  contactEnabled: boolean;
  contactFullWidth: boolean;
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
  const facilities = parseFacilities(formData);

  if ("error" in image) return image;
  if ("error" in linkedin) return linkedin;
  if ("error" in instagram) return instagram;
  if ("error" in location) return location;
  if ("error" in facilities) return facilities;

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
      contactEnabled: checkboxValue(formData, "contactEnabled"),
      contactFullWidth: checkboxValue(formData, "contactFullWidth"),
      facilitiesHeading,
      facilities: facilities.value,
    },
  };
}
