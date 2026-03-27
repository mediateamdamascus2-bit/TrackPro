## TrackPro

منصة لإدارة طلبات الفرع (طباعة/تصميم/فني/هدايا) مبنية بـ Next.js.

- **الاستضافة**: Vercel
- **قاعدة البيانات**: Postgres عبر Neon (من Vercel Storage)
- **تسجيل الدخول**: Auth.js (next-auth) بكلمة مرور
- **ORM**: Prisma

## Getting Started

### تشغيل محليًا

1) أنشئ ملف `.env.local` وضع:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=any-long-random-string
```

2) ثم شغّل:

```bash
npm run dev
```

افتح `http://localhost:3000`.

### نشر على Vercel (بدون Supabase)

1) في Vercel افتح مشروع `track-pro`.
2) من **Storage** أنشئ قاعدة **Neon Postgres** ثم **Connect** للمشروع.
   - هذا سيضيف تلقائيًا `DATABASE_URL` لمتغيرات البيئة.
3) من **Settings → Environment Variables** أضف:
   - `AUTH_SECRET`
4) اعمل Deploy/Redeploy.

ملاحظة: سكربت البناء يقوم بتشغيل `prisma db push` تلقائيًا على Vercel لإنشاء الجداول.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
