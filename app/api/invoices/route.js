import connectDB from "@/lib/db";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 1. GET: Saari invoices mangwane ke liye
export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("❌ INVOICE GET ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Nayi invoice create karne ke liye
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.clientName || !body.amount) {
      return NextResponse.json({ error: "Client Name and Amount are required" }, { status: 400 });
    }

    const newInvoice = await Invoice.create(body);
    console.log("✅ Invoice Generated:", newInvoice.invoiceNumber);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("❌ INVOICE POST ERROR:", error.message);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

// 3. PATCH: Status update karne ke liye (Unpaid to Paid)
export async function PATCH(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // URL se ID pakregay
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    console.log("✅ Status Updated to:", body.status);
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 4. DELETE: Invoice khatam karne ke liye
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ message: "Invoice Deleted Successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}