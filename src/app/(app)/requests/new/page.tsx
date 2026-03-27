import { NewRequestForm } from "./new-request-form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function NewRequestPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id as string | undefined;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "DEPARTMENT_STAFF") redirect("/dashboard");

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
