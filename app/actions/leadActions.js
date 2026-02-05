"use server";

import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import { revalidatePath } from "next/cache";

// 1. Lead Create karne wala function (Jo aapne likha hai)
export async function createLead(formData) {
  try {
    await connectDB();
    const clientName = formData.get("clientName");
    const service = formData.get("service");
    const value = formData.get("value");

    await Lead.create({
      clientName: clientName,
      service: service,
      value: Number(value),
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Data save karne mein masla:", error);
    return { success: false };
  }
}

// 2. NAYA: Lead Delete karne wala function
export async function deleteLead(id) {
  try {
    await connectDB();
    
    // ID ke zariye lead dhundo aur urha do
    await Lead.findByIdAndDelete(id);

    // Dashboard ko refresh karo taake delete hui lead gayab ho jaye
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Delete karne mein masla:", error);
    return { success: false };
  }
}