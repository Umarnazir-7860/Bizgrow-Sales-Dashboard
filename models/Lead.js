import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  clientName: { 
    type: String, 
    required: [true, "Client name is required"] 
  },
  companyName: { 
    type: String,
    default: "N/A" 
  },
  email: { 
    type: String,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String 
  },
  service: { 
    type: String, 
    required: true,
    enum: ["SIA ACS", "ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001"] 
  },
  value: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    default: "Cold Lead",
    enum: ["Cold Lead", "Warm Lead", "Hot Lead", "Call Booked", "Closed", "Cancelled"]
  },
}, { 
  timestamps: true // Ye line manually createdAt likhne se behtar hai
});

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);