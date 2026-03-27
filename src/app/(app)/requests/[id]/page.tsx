import { createClient } from "@/lib/supabase/server";
import {
  EVENT_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/labels";
import Link from "next/link";
import { notFound } from "next/navigation";

type Dept = { name_ar: string };
type ProfileMini = { full_name: string };
type EventRow = {
  id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown>;
  profiles: ProfileMini | ProfileMini[] | null;
};

function actorName(p: EventRow["profiles"]): string {
  if (!p) return "—";
  const x = Array.isArray(p) ? p[0] : p;
  return x?.full_name || "—";
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("requests")
    .select(
      `
      id,
      request_number,
      organization_name,
      contact_phone,
      description,
      request_type_slug,
      status,
      priority,
      due_at,
      created_at,
      updated_at,
      internal_notes,
      departments ( name_ar )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !request) {
    notFound();
  }

  const { data: eventsRaw } = await supabase
    .from("request_events")
    .select(
      `
      id,
      event_type,
      created_at,
      payload,
      profiles ( full_name )
    `,
    )
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const events = (eventsRaw ?? []) as EventRow[];

  const dept = request.departments as Dept | Dept[] | null;
  const deptName = dept
    ? Array.isArray(dept)
      ? dept[0]?.name_ar
      : dept.name_ar
    : "—";

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
            طلب #{request.request_number}
          </h1>
          <p className="mt-1 text-lg text-zinc-800 dark:text-zinc-200">
            {request.organization_name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-zinc-200 px-2 py-1 dark:bg-zinc-800">
            {STATUS_LABELS[request.status] ?? request.status}
          </span>
          <span
            className={
              request.priority === "urgent"
                ? "rounded-full bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                : "rounded-full bg-zinc-200 px-2 py-1 dark:bg-zinc-800"
            }
          >
            {PRIORITY_LABELS[request.priority] ?? request.priority}
          </span>
        </div>
      </div>

      <section className="grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-zinc-500">النوع والقسم</h2>
          <p className="mt-1">
            {TYPE_LABELS[request.request_type_slug] ?? request.request_type_slug}{" "}
            · {deptName}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-500">الهاتف</h2>
          <p className="mt-1 font-mono" dir="ltr">
            {request.contact_phone ?? "—"}
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
            {request.due_at
              ? new Date(request.due_at).toLocaleString("ar-SA", {
                  dateStyle: "full",
                  timeStyle: "short",
                })
              : "—"}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-zinc-500">تاريخ التسجيل</h2>
          <p className="mt-1">
            {new Date(request.created_at).toLocaleString("ar-SA", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        {request.internal_notes && (
          <div className="sm:col-span-2">
            <h2 className="text-sm font-medium text-zinc-500">ملاحظات داخلية</h2>
            <p className="mt-2 whitespace-pre-wrap">{request.internal_notes}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">السجل الزمني</h2>
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500">لا أحداث مسجّلة بعد.</p>
        ) : (
          <ul className="space-y-3 border-r-2 border-emerald-200 pr-4 dark:border-emerald-900">
            {events.map((ev) => (
              <li key={ev.id} className="relative">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {EVENT_LABELS[ev.event_type] ?? ev.event_type}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(ev.created_at).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · {actorName(ev.profiles)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
