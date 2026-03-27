import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  EVENT_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/labels";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const request = await db.request.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, email: true } } },
      },
    },
  });

  if (!request) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400"
          >
            ← الطلبات
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            طلب #{request.requestNumber}
          </h1>
          <p className="mt-1 text-lg text-zinc-800 dark:text-zinc-200">
            {request.organizationName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-zinc-200 px-2 py-1 dark:bg-zinc-800">
            {STATUS_LABELS[request.status.toLowerCase()] ?? request.status}
          </span>
          <span
            className={
              request.priority === "URGENT"
                ? "rounded-full bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                : "rounded-full bg-zinc-200 px-2 py-1 dark:bg-zinc-800"
            }
          >
            {PRIORITY_LABELS[request.priority.toLowerCase()] ??
              request.priority}
          </span>
        </div>
      </div>

      <section className="grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-zinc-500">النوع والقسم</h2>
          <p className="mt-1">
            {TYPE_LABELS[request.requestType.toLowerCase()] ??
              request.requestType}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-500">الهاتف</h2>
          <p className="mt-1 font-mono" dir="ltr">
            {request.contactPhone ?? "—"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <h2 className="text-sm font-medium text-zinc-500">الوصف</h2>
          <p className="mt-2 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
            {request.description}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-500">موعد التسليم</h2>
          <p className="mt-1">
            {request.dueAt
              ? new Date(request.dueAt).toLocaleString("ar-SA", {
                  dateStyle: "full",
                  timeStyle: "short",
                })
              : "—"}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-500">تاريخ التسجيل</h2>
          <p className="mt-1">
            {new Date(request.createdAt).toLocaleString("ar-SA", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        {request.internalNotes && (
          <div className="sm:col-span-2">
            <h2 className="text-sm font-medium text-zinc-500">ملاحظات داخلية</h2>
            <p className="mt-2 whitespace-pre-wrap">{request.internalNotes}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">السجل الزمني</h2>
        {request.events.length === 0 ? (
          <p className="text-sm text-zinc-500">لا أحداث مسجّلة بعد.</p>
        ) : (
          <ul className="space-y-3 border-r-2 border-emerald-200 pr-4 dark:border-emerald-900">
            {request.events.map((ev) => (
              <li key={ev.id} className="relative">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(ev.createdAt).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · {ev.actor?.name ?? ev.actor?.email ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
