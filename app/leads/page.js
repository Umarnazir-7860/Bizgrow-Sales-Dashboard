"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, Trash2, Eye, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
    }
  };

  const deleteLead = async (id) => {
    if (window.confirm("Bhai, kya aap waqai is lead ko delete karna chahte hain?")) {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Status Badge Color Logic
  const getStatusStyle = (status) => {
    switch (status) {
      case "Closed": return "bg-green-100 text-green-700 border-green-200";
      case "Hot Lead": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Warm Lead": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Cold Lead": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Call Booked": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  if (loading) return <div className="p-10 font-black text-[#12066a] animate-pulse">LOADING DATABASE...</div>;

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#12066a] tracking-tight">Lead Management</h1>
            <p className="text-zinc-500 font-bold text-sm mt-1 uppercase tracking-widest opacity-70">Total Records: {filteredLeads.length}</p>
          </div>
          <button className="flex items-center gap-2 bg-[#12066a] text-white px-6 py-4 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform">
            <UserPlus size={18} /> <Link href="/">ADD NEW PROSPECT</Link> 
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#12066a] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by client name or email..." 
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-[#12066a] shadow-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-zinc-100">
            <Filter size={18} className="text-[#12066a]" />
            <select 
              className="bg-transparent font-black text-sm outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Cold Lead">Cold Lead</option>
              <option value="Warm Lead">Warm Lead</option>
              <option value="Hot Lead">Hot Lead</option>
              <option value="Call Booked">Call Booked</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="p-6 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Client Information</th>
                  <th className="p-6 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Required Service</th>
                  <th className="p-6 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Value</th>
                  <th className="p-6 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Current Status</th>
                  <th className="p-6 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-zinc-50/80 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-[#12066a] text-lg">{lead.clientName}</p>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">{lead.companyName || "No Company"}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-black bg-zinc-100 px-4 py-2 rounded-xl text-zinc-700">
                        {lead.service}
                      </span>
                    </td>
                    <td className="p-6 font-black text-[#12066a]">£{lead.value.toLocaleString()}</td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-xl border-b-2 uppercase tracking-widest ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                      
                        <button 
                          onClick={() => deleteLead(lead._id)}
                          className="p-3 bg-zinc-50 text-zinc-400 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-zinc-400 font-black italic text-lg uppercase tracking-widest">No matching leads found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}