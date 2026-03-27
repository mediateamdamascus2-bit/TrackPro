"use client";

import { createRequest, type CreateRequestState } from "./actions";
import { useActionState } from "react";

export function NewRequestForm() {
  const [state, formAction, isPending] = useActionState(
    createRequest,
    null as CreateRequestState,
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-5">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          الجهة الطالبة
        </span>
        <input
          required
          name="organization_name"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          هاتف التواصل
        </span>
        <input
          name="contact_phone"
          type="tel"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          dir="ltr"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          نوع الطلب / القسم
        </span>
        <select
          required
          name="request_type_slug"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          defaultValue="printing"
        >
          <option value="printing">طباعة</option>
          <option value="design">تصميم</option>
          <option value="technical">فني</option>
          <option value="gifts">هدايا</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          الوصف
        </span>
        <textarea
          required
          name="description"
          rows={4}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          موعد التسليم (اختياري)
        </span>
        <input
          name="due_at"
          type="datetime-local"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          dir="ltr"
        />
      </label>

      <fieldset className="flex gap-4 text-sm">
        <legend className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">
          الأولوية
        </legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="priority" value="normal" defaultChecked />
          عادي
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="priority" value="urgent" />
          عاجل
        </label>
      </fieldset>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        {isPending ? "جارٍ الحفظ…" : "تسجيل الطلب"}
      </button>
    </form>
  );
}
