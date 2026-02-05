import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Unpaid", "Overdue"], default: "Unpaid" },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);