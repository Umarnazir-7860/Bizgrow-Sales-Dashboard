import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find({});

    // Month-wise grouping logic
    const monthlyData = leads.reduce((acc, lead) => {
      const month = new Date(lead.createdAt).toLocaleString('default', { month: 'short' });
      const year = new Date(lead.createdAt).getFullYear();
      const key = `${month} ${year}`;

      if (!acc[key]) acc[key] = { month: key, revenue: 0, count: 0 };
      acc[key].revenue += Number(lead.value) || 0;
      acc[key].count += 1;
      return acc;
    }, {});

    return NextResponse.json(Object.values(monthlyData), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}