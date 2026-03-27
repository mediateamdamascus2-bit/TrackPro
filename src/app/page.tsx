import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
            TrackPro
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            منصة إدارة طلبات الفرع
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            متابعة الطباعة والتصميم والفني والهدايا من مكان واحد.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            إنشاء حساب
          </Link>
        </div>

        <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>بعد أول تسجيل: حدّث الدور في Supabase → جدول profiles</li>
          <li>
            مسؤول تواصل أو مدير: يمكنه{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              طلب جديد
            </strong>
          </li>
        </ul>
      </main>
    </div>
  );
}
