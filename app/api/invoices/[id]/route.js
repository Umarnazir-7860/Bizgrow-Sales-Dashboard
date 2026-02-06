import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

// Schema ko robust banaya hai
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  clientName: String,
  clientCompanyName: String,
  clientAddress: String,
  items: Array,
  subtotal: Number,
  taxAmount: Number,
  totalAmount: Number, // ✨ PDF ke liye ye zaroori hai
  amount: Number,      // ✨ Database validation ke liye ye zaroori hai
  status: { type: String, default: "Unpaid" },
  dueDate: String,
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

// UPDATE STATUS (PATCH)
export async function PATCH(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // ID url se li (e.g. /api/invoices?id=123)
    
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE INVOICE
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}