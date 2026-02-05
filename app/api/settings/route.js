import connectDB from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({}); // Default settings create kar dega agar nahi hain
  }
  return NextResponse.json(settings);
}

export async function PUT(req) {
  await connectDB();
  const body = await req.json();
  const settings = await Settings.findOneAndUpdate({}, body, { new: true, upsert: true });
  return NextResponse.json(settings);
}