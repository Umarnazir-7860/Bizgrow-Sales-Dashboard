import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/models/Invoice";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Latest Invoice Number logic
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNum = 100;
    if (lastInvoice?.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.replace("INV-", ""));
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    const invoiceNumber = `INV-${nextNum}`;

    // Calculations
    const subtotal = body.items.reduce((acc, item) => {
      return acc + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
    }, 0);
    const total = subtotal + (subtotal * 0.20);

    // ✨ Important: Aapke model ki requirements poori karna
    const invoiceData = {
      ...body,
      invoiceNumber,
      totalAmount: total, // Frontend ke liye
      amount: total.toString(), // Aapke database schema ke liye
    };

    const newInvoice = await Invoice.create(invoiceData);
    
    // Success Response
    return NextResponse.json(newInvoice, { status: 201 });

  } catch (error) {
    console.error("❌ POST ERROR:", error);
    // Yeh response alert mein error message dikhayega
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    
    let nextNum = 100;
    if (lastInvoice?.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.replace("INV-", ""));
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    return NextResponse.json({ 
      invoices: invoices || [], 
      nextInvoiceNumber: `INV-${nextNum}` 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(req) {
  try {
    await connectDB();
    
    // URL se ID nikalne ka sahi tareeka
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}