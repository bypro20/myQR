import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "myqr_session";

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return false;
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthed(req);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!authed) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname === "/login" && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login"],
};
