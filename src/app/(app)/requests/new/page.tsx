import { createClient } from "@/lib/supabase/server";
import { NewRequestForm } from "./new-request-form";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "department_staff") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">طلب جديد</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            يُحفظ الطلب ويُوجَّه تلقائيًا للقسم حسب النوع.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400"
        >
          رجوع للقائمة
        </Link>
      </div>
      <NewRequestForm />
    </div>
  );
}
