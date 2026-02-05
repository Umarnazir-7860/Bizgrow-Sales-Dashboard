// app/api/leads/[id]/route.js
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted Successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    // Yahan {...body} likhne se faida ye hai ke agar aap 
    // status ke ilawa value ya phone bhi bhejenge to wo bhi update ho jayega
    const updatedLead = await Lead.findByIdAndUpdate(
      id, 
      { ...body }, 
      { new: true, runValidators: true } // Validators on rakhna best hai
    );
    
    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}