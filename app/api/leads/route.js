import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 1. GET: Purana data dikhane ke liye
export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("❌ GET ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Naya prospect save karne ke liye
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json(); // Frontend se data pakadna
    
    // Data check karein (Debugging ke liye)
    console.log("📩 Received Data:", body);

    const newLead = await Lead.create(body);
    console.log("✅ Lead Saved:", newLead._id);
    
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("❌ POST ERROR:", error.message);
    return NextResponse.json(
      { error: "Failed to save lead", details: error.message },
      { status: 500 }
    );
  }
}