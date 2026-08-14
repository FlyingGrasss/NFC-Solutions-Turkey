export const defaultProfileButtonOrder = [
  "call",
  "whatsapp",
  "telegram",
  "email",
  "linkedin",
  "contact",
  "location",
  "instagram",
  "iban",
] as const;

export type BuiltInProfileButtonKey = (typeof defaultProfileButtonOrder)[number];

export const profileButtonLabels: Record<BuiltInProfileButtonKey, string> = {
  call: "Ara",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  email: "Mail",
  linkedin: "LinkedIn",
  contact: "Kişilere Ekle",
  location: "Konum",
  instagram: "Instagram",
  iban: "IBAN",
};

export function normalizeProfileButtonOrder(
  value: string | null | undefined,
  customKeys: string[],
) {
  const allowedKeys = [...defaultProfileButtonOrder, ...customKeys];
  const allowed = new Set(allowedKeys);
  let parsed: unknown = null;

  if (value) {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = null;
    }
  }

  const order = Array.isArray(parsed)
    ? parsed.filter((key): key is string => typeof key === "string" && allowed.has(key))
    : [];

  return [...new Set([...order, ...allowedKeys])];
}
