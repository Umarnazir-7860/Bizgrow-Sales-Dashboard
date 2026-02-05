import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  businessName: { type: String, default: "Bizgrow Holdings" },
  email: { type: String, default: "info@bizgrow-holdings.com" },
  bankName: String,
  accountName: String,
  accountNumber: String,
  sortCode: String,
  currency: { type: String, default: "GBP" },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);