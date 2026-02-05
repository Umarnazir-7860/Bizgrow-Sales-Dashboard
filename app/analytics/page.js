"use client";
import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Calendar, TrendingUp, PoundSterling, BarChart3, Layers } from "lucide-react";

export default function AnalyticsPage() {
  const [allLeads, setAllLeads] = useState([]);
  const [filteredServiceData, setFilteredServiceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState(["2026"]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#12066a", "#4f46e5", "#8b5cf6", "#06b6d4", "#ec4899"];

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/leads");
        const leads = await res.json();
        setAllLeads(leads);

        // Saare years nikalna aur sort karna (Future proofing)
        const years = [...new Set(leads.map(l => new Date(l.createdAt).getFullYear().toString()))];
        if (!years.includes("2026")) years.push("2026");
        setAvailableYears(years.sort((a, b) => b - a)); // Latest year upar

        processData(leads, selectedYear);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // Jab year change ho toh auto-update
  useEffect(() => {
    processData(allLeads, selectedYear);
  }, [selectedYear, allLeads]);

  const processData = (leads, year) => {
    // 🎯 Step 1: Filter by Year (Isi se reset aur change handle hoga)
    const yearlyLeads = leads.filter(l => new Date(l.createdAt).getFullYear().toString() === year);

    // 🎯 Step 2: Monthly Tracking Logic
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mData = months.map(m => ({ month: m, revenue: 0 }));

    yearlyLeads.forEach(lead => {
      const mIndex = new Date(lead.createdAt).getMonth();
      mData[mIndex].revenue += (Number(lead.value) || 0);
    });
    setMonthlyData(mData);

    // 🎯 Step 3: Service Breakdown (Pie Chart)
    const serviceCounts = yearlyLeads.reduce((acc, lead) => {
      acc[lead.service] = (acc[lead.service] || 0) + (Number(lead.value) || 0);
      return acc;
    }, {});

    const totalRev = Object.values(serviceCounts).reduce((a, b) => a + b, 0);

    setFilteredServiceData(Object.keys(serviceCounts).map(key => ({
      name: key,
      value: serviceCounts[key],
      percentage: totalRev > 0 ? ((serviceCounts[key] / totalRev) * 100).toFixed(1) : 0
    })));
  };

  const totalYearlyRevenue = monthlyData.reduce((a, b) => a + b.revenue, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50">
      <div className="text-xl font-black text-[#12066a] animate-bounce flex items-center gap-2">
        <BarChart3 className="animate-pulse" /> INITIALIZING INTELLIGENCE...
      </div>
    </div>
  );

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#12066a] flex items-center gap-3">
              <BarChart3 size={36} /> Sales Intelligence
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Data visualization for {selectedYear} fiscal year
            </p>
          </div>
          
          {/* Year Switcher (Automatic Reset Control) */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm">
            <Calendar size={18} className="text-[#12066a]" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-black text-sm outline-none cursor-pointer text-[#12066a]"
            >
              {availableYears.map(y => <option key={y} value={y}>{y} Analysis</option>)}
            </select>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#12066a] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <PoundSterling className="mb-2 opacity-50" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total {selectedYear} Revenue</p>
              <h2 className="text-4xl font-black italic">£{totalYearlyRevenue.toLocaleString()}</h2>
            </div>
            <TrendingUp size={120} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm flex items-center gap-5">
             <div className="p-4 bg-zinc-50 rounded-2xl text-[#12066a]"><Layers size={24}/></div>
             <div>
               <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">Active Services</p>
               <p className="text-2xl font-black text-[#12066a]">{filteredServiceData.length}</p>
             </div>
          </div>
        </div>

        {/* MONTHLY BAR CHART SECTION */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-[#12066a]">Monthly Performance Trend</h2>
            <span className="text-[10px] font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 uppercase">Financial Year: {selectedYear}</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 'bold'}} tickFormatter={(v) => `£${v}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(18, 6, 106, 0.1)'}}
                  formatter={(v) => [`£${v.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#12066a" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART & SERVICE LIST */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm h-[500px]">
            <h2 className="text-lg font-black mb-4">Service Revenue Share</h2>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={filteredServiceData} innerRadius={100} outerRadius={140} paddingAngle={8} dataKey="value">
                  {filteredServiceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-12 lg:col-span-5 bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-black mb-8 text-[#12066a]">Department Analysis</h2>
            <div className="space-y-8">
              {filteredServiceData.length > 0 ? filteredServiceData.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.name}</span>
                    <span className="text-sm font-black text-[#12066a]">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-2 font-bold italic group-hover:text-[#12066a] transition-colors">Total Contribution: £{item.value.toLocaleString()}</p>
                </div>
              )) : (
                <div className="text-center py-20 text-zinc-400 font-bold italic">
                  No data available for {selectedYear}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}