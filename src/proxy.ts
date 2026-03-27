import { type NextRequest } from "next/server";
import {
  authProxyResponse,
  updateSession,
} from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const session = await updateSession(request);
  return authProxyResponse(request, session);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
