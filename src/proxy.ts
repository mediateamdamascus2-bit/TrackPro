export { auth as proxy } from "@/auth";

// Important: don't run proxy on static assets, otherwise CSS/JS may be blocked
// and pages will appear unstyled.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
