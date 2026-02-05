// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: [], // Filhal sab kuch bypass kar do
};