"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/profile";
import {
  clearProfileSession,
  createProfileSession,
  requireProfileAdmin,
} from "@/lib/profile-auth";
import {
  parseProfileFields,
  type ProfileCustomButtonInput,
  type ProfileFields,
} from "@/lib/profile-form";
import { requireSession } from "@/lib/auth-helpers";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

function passwordValue(formData: FormData, required: boolean) {
  const value = formData.get("password");
  const password = typeof value === "string" ? value.trim() : "";

  if (!password && !required) {
    return { value: null } as const;
  }

  if (password.length < 6 || password.length > 100) {
    return { error: "Şifre 6-100 karakter arasında olmalı." } as const;
  }

  return { value: password } as const;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && error.message.includes("Unique constraint");
}

function profileData(fields: ProfileFields) {
  const { facilities, customButtons, buttonOrder, ...data } = fields;
  void facilities;
  void customButtons;
  // Keep empty optional titles compatible with already-generated Prisma clients
  // that still expect the pre-migration required field shape.
  return {
    ...data,
    buttonOrder: JSON.stringify(buttonOrder),
    title: data.title ?? "",
  };
}

async function replaceFacilities(
  profileId: string,
  facilities: ProfileFields["facilities"],
) {
  await prisma.$transaction([
    prisma.profileFacility.deleteMany({ where: { profileId } }),
    prisma.profileFacility.createMany({
      data: facilities.map((facility, index) => ({
        name: facility.name,
        url: facility.url,
        sortOrder: index,
        profileId,
      })),
    }),
  ]);
}

async function replaceCustomButtons(
  profileId: string,
  buttons: ProfileCustomButtonInput[],
  buttonOrder: string[],
) {
  await prisma.$transaction([
    prisma.profileCustomButton.deleteMany({ where: { profileId } }),
    prisma.profileCustomButton.createMany({
      data: buttons.map((button) => ({
        buttonKey: button.key,
        label: button.label,
        url: button.url,
        fullWidth: button.fullWidth,
        sortOrder: buttonOrder.indexOf(button.key),
        profileId,
      })),
    }),
  ]);
}

export async function signInProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const password = formData.get("password");

  if (!slug || typeof password !== "string") {
    return { error: "Kısa adres ve şifre zorunludur." };
  }

  const profile = await prisma.profile.findUnique({ where: { slug } });

  if (!profile || !(await compare(password, profile.passwordHash))) {
    return { error: "Şifre hatalı." };
  }

  await createProfileSession(profile.id);
  redirect(`/${profile.slug}/admin`);
}

export async function signOutProfileAction() {
  await clearProfileSession();
  redirect("/");
}

export async function updateOwnedProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const requestedSlug = normalizeSlug(String(formData.get("slug") ?? ""));
  const profile = await requireProfileAdmin(requestedSlug);
  const parsed = parseProfileFields(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const data = { ...parsed.value, slug: profile.slug };

  try {
    await prisma.profile.update({
      where: { id: profile.id },
      data: profileData(data),
    });
    await replaceFacilities(profile.id, data.facilities);
    await replaceCustomButtons(profile.id, data.customButtons, data.buttonOrder);
  } catch (error) {
    console.error("[updateOwnedProfileAction] Profile update failed", error);
    return {
      error: isUniqueConstraintError(error)
        ? "Bu kısa adres zaten kullanılıyor."
        : "Profil kaydedilemedi.",
    };
  }

  revalidatePath(`/${profile.slug}`);
  revalidatePath(`/${profile.slug}/admin`);
  revalidatePath("/admin/profiles");
  redirect(`/${profile.slug}/admin`);
}

export async function createProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireSession();
  const parsed = parseProfileFields(formData);
  const password = passwordValue(formData, true);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if ("error" in password) {
    return { error: password.error };
  }

  if (!password.value) {
    return { error: "Profil şifresi zorunludur." };
  }

  let createdProfileId = "";

  try {
    const profile = await prisma.profile.create({
      data: {
        ...profileData(parsed.value),
        passwordHash: await hash(password.value, 12),
        facilities: {
          create: parsed.value.facilities.map((facility, index) => ({
            name: facility.name,
            url: facility.url,
            sortOrder: index,
          })),
        },
        customButtons: {
          create: parsed.value.customButtons.map((button) => ({
            buttonKey: button.key,
            label: button.label,
            url: button.url,
            fullWidth: button.fullWidth,
            sortOrder: parsed.value.buttonOrder.indexOf(button.key),
          })),
        },
      },
    });

    createdProfileId = profile.id;
  } catch (error) {
    console.error("[createProfileAction] Profile creation failed", error);
    return {
      error: isUniqueConstraintError(error)
        ? "Bu kısa adres zaten kullanılıyor."
      : "Profil oluşturulamadı.",
    };
  }

  revalidatePath("/admin/profiles");
  redirect(`/admin/profiles/${createdProfileId}`);
}

export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireSession();
  const id = formData.get("id");
  const parsed = parseProfileFields(formData);
  const password = passwordValue(formData, false);

  if (typeof id !== "string" || !id) {
    return { error: "Profil bulunamadı." };
  }

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if ("error" in password) {
    return { error: password.error };
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!existingProfile) {
    return { error: "Profil bulunamadı." };
  }

  try {
    await prisma.profile.update({
      where: { id },
      data: {
        ...profileData(parsed.value),
        ...(password.value ? { passwordHash: await hash(password.value, 12) } : {}),
      },
    });
    await replaceFacilities(id, parsed.value.facilities);
    await replaceCustomButtons(id, parsed.value.customButtons, parsed.value.buttonOrder);

    if (password.value) {
      await prisma.profileSession.deleteMany({ where: { profileId: id } });
    }
  } catch (error) {
    console.error("[updateProfileAction] Profile update failed", error);
    return {
      error: isUniqueConstraintError(error)
        ? "Bu kısa adres zaten kullanılıyor."
        : "Profil kaydedilemedi.",
    };
  }

  revalidatePath("/admin/profiles");
  revalidatePath(`/admin/profiles/${id}`);
  revalidatePath(`/${existingProfile.slug}`);
  revalidatePath(`/${parsed.value.slug}`);
  redirect(`/admin/profiles/${id}`);
}
