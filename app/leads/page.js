"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, Trash2, UserPlus, Building2 } from "lucide-react";
import Link from "next/link";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteLead = async (id) => {
    if (window.confirm("Bhai, delete kar dain?")) {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Closed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Hot Lead":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Warm Lead":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans transition-all duration-300">
      <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl mt-14 md:mt-0 font-black text-[#12066a] tracking-tight">Lead Management</h1>
            <p className="text-zinc-500 font-bold text-xs mt-1 uppercase tracking-widest opacity-70">
              Total Records: {filteredLeads.length}
            </p>
          </div>
          <Link href="/" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12066a] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95">
            <UserPlus size={18} /> ADD PROSPECT
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search leads by name or email..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-[#12066a] focus:ring-4 focus:ring-blue-50 shadow-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-zinc-200">
            <Filter size={18} className="text-[#12066a]" />
            <select
              className="bg-transparent font-black text-sm outline-none cursor-pointer w-full min-w-[150px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Categories</option>
              {["Cold Lead", "Warm Lead", "Hot Lead", "Call Booked", "Closed", "Cancelled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden">
          {leads.length === 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                  <th className="p-8">Client Information</th>
                  <th className="p-8 text-center">Required Service</th>
                  <th className="p-8 text-center">Value</th>
                  <th className="p-8 text-center">Status</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="group">
                    <td className="p-8 h-10 rounded-lg shimmer"></td>
                    <td className="p-8 h-10 rounded-lg shimmer"></td>
                    <td className="p-8 h-10 rounded-lg shimmer"></td>
                    <td className="p-8 h-10 rounded-lg shimmer"></td>
                    <td className="p-8 h-10 rounded-lg shimmer"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                  <th className="p-8">Client Information</th>
                  <th className="p-8 text-center">Required Service</th>
                  <th className="p-8 text-center">Value</th>
                  <th className="p-8 text-center">Status</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="p-8">
                      <p className="font-black text-[#12066a] text-xl">{lead.clientName}</p>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-tight">{lead.companyName || "No Company"}</p>
                    </td>
                    <td className="p-8 text-center">
                      <span className="text-[11px] font-black bg-zinc-100 px-4 py-2 rounded-xl text-zinc-700 uppercase">{lead.service}</span>
                    </td>
                    <td className="p-8 text-center font-black text-[#12066a] text-lg">£{Number(lead.value).toLocaleString()}</td>
                    <td className="p-8 text-center">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-wider ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <button onClick={() => deleteLead(lead._id)} className="p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile & Tablet Cards */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.length === 0 ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                <div className="h-6 w-3/4 mb-4 rounded-lg shimmer"></div>
                <div className="h-4 w-1/2 mb-2 rounded-lg shimmer"></div>
                <div className="h-4 w-1/3 rounded-lg shimmer"></div>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="h-4 w-full rounded-lg shimmer"></div>
                  <div className="h-4 w-full rounded-lg shimmer"></div>
                </div>
              </div>
            ))
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead._id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-[#12066a] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="max-w-[70%]">
                    <h3 className="font-black text-[#12066a] text-xl truncate">{lead.clientName}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1 mt-1">
                      <Building2 size={10} /> {lead.companyName || "No Company"}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase ${getStatusStyle(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Service</p>
                    <p className="text-xs font-black truncate">{lead.service}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Value</p>
                    <p className="text-sm font-black text-[#12066a]">£{Number(lead.value).toLocaleString()}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteLead(lead._id)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} /> DELETE RECORD
                </button>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {leads.length > 0 && filteredLeads.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-zinc-200 mt-8">
            <p className="text-zinc-400 font-black italic uppercase tracking-widest text-lg">No prospects match your search</p>
          </div>
        )}

      </div>
    </div>
  );
}
