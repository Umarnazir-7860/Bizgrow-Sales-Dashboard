import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  // BizGrow ki apni details
  businessName: { type: String, default: "BizGrow Holdings Ltd" },
  businessAddress: { type: String, default: "Cranbrook House, 61 Cranbrook Road, Ilford, Essex, IG1 4PG" },
  businessPhone: { type: String, default: "+447898205035" },
  businessEmail: { type: String },
  businessWebsite: { type: String, default: "https://bizgrow-holdings.com/" },
  
  // UK Specific Details
  vatNumber: { type: String }, // Agar Sir ka VAT number hai toh
  registrationNumber: { type: String, default: "14026241" }, // Jo T&C mein likha tha
  
  // Default values jo Invoice banate waqt khud hi fill ho jayengi
  defaultTaxRate: { type: Number, default: 20 }, 
  currencySymbol: { type: String, default: "£" },
  currencyCode: { type: String, default: "GBP" },

  // Ye sab se zaroori hai: Poori "Terms and Conditions" yahan save hongi
  defaultTerms: { type: String }, 
  
  // Dashboard Settings
  monthlyTarget: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);