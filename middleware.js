import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Agar user Login NAHI hai aur Home (Dashboard) ya Invoices pe ja raha hai
  // Hum check kar rahe hain ke path "/" hai ya "/invoices"
  const isDashboardHome = pathname === "/";
  const isProtected = isDashboardHome || pathname.startsWith("/invoices") || pathname.startsWith("/api/leads");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Agar user Login HAI aur Login page pe janay ki koshish kare
  if (pathname.startsWith("/login") && token) {
    return NextResponse.redirect(new URL("/", req.url)); // Wapis home (dashboard) bhej do
  }

  return NextResponse.next();
}

export const config = {
  // Matcher mein ab "/" bhi shamil hai
  matcher: ["/", "/invoices/:path*", "/login", "/api/leads/:path*"],
};