import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { config as appConfig } from "@/config";
import { ROLES, type UserRole } from "@/features/auth/constants";

const getSecretKey = () => new TextEncoder().encode(appConfig.auth.jwtSecret);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(appConfig.auth.cookieName)?.value;

  let userRole: UserRole | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey(), {
        algorithms: ["HS256"],
      });
      userRole = (payload as { role?: UserRole }).role ?? null;
    } catch {
      userRole = null;
    }
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isStaffPath = pathname.startsWith("/staff");
  const isMemberPath = pathname.startsWith("/member");

  // Guard protected routes
  if (isAdminPath) {
    if (!userRole) return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`, request.url));
    if (userRole !== ROLES.ADMIN) return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isStaffPath) {
    if (!userRole) return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`, request.url));
    if (userRole !== ROLES.STAFF && userRole !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (isMemberPath) {
    if (!userRole) return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/member/:path*", "/login", "/register", "/verify-email", "/set-password"],
};
