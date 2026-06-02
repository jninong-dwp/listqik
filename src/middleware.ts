import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { HOME_LOCALE_COOKIE_KEY } from "@/i18n/home-locale";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export default function middleware(req: Parameters<typeof authMiddleware>[0]) {
  const { pathname } = req.nextUrl;

  // Keep existing auth protection for dashboard routes.
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname.startsWith("/api/dashboard/")) {
    return authMiddleware(req);
  }

  // Locale routing: `/es/*` is the Spanish URL namespace.
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const res = NextResponse.next();
    res.cookies.set(HOME_LOCALE_COOKIE_KEY, "es", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/es", "/es/:path*"],
};
