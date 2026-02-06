import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  
  // ✨ Client Details (Added Company Name)
  clientCompanyName: { type: String, required: true }, // BOLD SECURITY SOLUTIONS LTD ke liye
  clientName: { type: String, required: true },       // Gulfam Arshad ke liye
  clientEmail: { type: String },
  clientAddress: { type: String }, // Street and Number
  clientCity: { type: String },    // Glasgow ke liye
  clientPostcode: { type: String }, // G3 8HZ ke liye
  clientCountry: { type: String, default: "GB" },
  
  items: [
    {
      serviceName: { type: String, required: true }, 
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 },
      taxRate: { type: Number, default: 20 }, 
      discount: { type: Number, default: 0 },
    }
  ],

  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true }, 
  
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // Pay £240.00 wali logic
  
  currency: { type: String, default: "GBP" }, 
  currencySymbol: { type: String, default: "£" },
  status: { type: String, enum: ["Paid", "Unpaid", "Pending"], default: "Unpaid" },
  
  // ✨ Terms & Conditions (Aapki detailed text ke liye)
  terms: { type: String },
  notes: { type: String }, 
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);