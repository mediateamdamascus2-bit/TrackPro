"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateRequestState = { error: string } | null;

export async function createRequest(
  _prev: CreateRequestState,
  formData: FormData,
): Promise<CreateRequestState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "يجب تسجيل الدخول" };
  }

  const userId = session.user.id as string | undefined;
  if (!userId) return { error: "تعذر تحديد المستخدم" };

  const organization_name = String(
    formData.get("organization_name") ?? "",
  ).trim();
  const contact_phone =
    String(formData.get("contact_phone") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const request_type_slug = String(formData.get("request_type_slug") ?? "");
  const priorityRaw = String(formData.get("priority") ?? "normal");
  const dueRaw = String(formData.get("due_at") ?? "").trim();
  const due_at = dueRaw ? new Date(dueRaw) : null;

  if (!organization_name || !description) {
    return { error: "الجهة الطالبة والوصف مطلوبان" };
  }

  const type = request_type_slug.toUpperCase();
  const allowed = ["PRINTING", "DESIGN", "TECHNICAL", "GIFTS"];
  if (!allowed.includes(type)) {
    return { error: "نوع الطلب غير صالح" };
  }

  const inserted = await db.request.create({
    data: {
      organizationName: organization_name,
      contactPhone: contact_phone,
      description,
      // @ts-expect-error Prisma enum
      requestType: type,
      priority: priorityRaw === "urgent" ? "URGENT" : "NORMAL",
      dueAt: due_at,
      createdById: userId,
      events: {
        create: {
          eventType: "created",
          actorId: userId,
          payload: {},
        },
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/requests/${inserted.id}`);
}
