import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

// Invoice Model (Agar alag file mein hai to wahan se import karein)
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", new mongoose.Schema({
  invoiceNumber: String,
  clientName: String,
  amount: String,
  status: String,
  dueDate: String,
}));

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await Invoice.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}