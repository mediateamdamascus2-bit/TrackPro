"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateRequestState = { error: string } | null;

export async function createRequest(
  _prev: CreateRequestState,
  formData: FormData,
): Promise<CreateRequestState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "يجب تسجيل الدخول" };
  }

  const organization_name = String(formData.get("organization_name") ?? "").trim();
  const contact_phone =
    String(formData.get("contact_phone") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const request_type_slug = String(formData.get("request_type_slug") ?? "");
  const priorityRaw = String(formData.get("priority") ?? "normal");
  const dueRaw = String(formData.get("due_at") ?? "").trim();
  const due_at = dueRaw ? new Date(dueRaw).toISOString() : null;

  if (!organization_name || !description) {
    return { error: "الجهة الطالبة والوصف مطلوبان" };
  }

  const { data: dept, error: deptError } = await supabase
    .from("departments")
    .select("id")
    .eq("slug", request_type_slug)
    .maybeSingle();

  if (deptError || !dept) {
    return { error: "نوع الطلب غير صالح" };
  }

  const { data: inserted, error } = await supabase
    .from("requests")
    .insert({
      organization_name,
      contact_phone,
      description,
      request_type_slug,
      department_id: dept.id,
      status: "submitted",
      priority: priorityRaw === "urgent" ? "urgent" : "normal",
      due_at,
      created_by: user.id,
    })
    .select("id, request_number")
    .single();

  if (error) {
    if (
      error.code === "42501" ||
      error.message.toLowerCase().includes("policy")
    ) {
      return { error: "ليس لديك صلاحية إنشاء طلب" };
    }
    return { error: error.message };
  }

  await supabase.from("request_events").insert({
    request_id: inserted.id,
    event_type: "created",
    actor_id: user.id,
    payload: { request_number: inserted.request_number },
  });

  revalidatePath("/dashboard");
  redirect(`/requests/${inserted.id}`);
}
