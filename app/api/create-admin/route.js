import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    // Naya password jo aapne rakhna hai
    const hashedPassword = await bcrypt.hash("bizgrow123@#$", 10); 

    const newUser = await User.create({
      name: "Admin",
      email: "admin@bizgrow.com",
      password: hashedPassword,
      role: "admin"
    });

    return NextResponse.json({ message: "Naya Admin Ban Gaya!", email: newUser.email });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}