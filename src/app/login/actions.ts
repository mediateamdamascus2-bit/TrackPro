"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { db } from "@/lib/db";

export type LoginActionState = { error?: string; ok?: string } | null;

export async function registerUser(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!process.env.DATABASE_URL) {
    return {
      error:
        "قاعدة البيانات غير مهيّأة (DATABASE_URL). ضع DATABASE_URL في .env.local ثم أعد تشغيل السيرفر.",
    };
  }

  const name = String(formData.get("fullName") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 6) {
    return { error: "أدخل بريدًا صحيحًا وكلمة مرور لا تقل عن 6 أحرف." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "هذا البريد مسجل مسبقًا." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      email,
      name: name ?? undefined,
      passwordHash,
    },
  });

  return { ok: "تم إنشاء الحساب. يمكنك تسجيل الدخول الآن." };
}

export async function loginUser(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!process.env.DATABASE_URL) {
    return {
      error:
        "قاعدة البيانات غير مهيّأة (DATABASE_URL). ضع DATABASE_URL في .env.local ثم أعد تشغيل السيرفر.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch {
    return { error: "بيانات الدخول غير صحيحة." };
  }

  redirect("/dashboard");
}

