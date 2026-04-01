"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, Trash2, UserPlus, Building2, LayoutGrid, ListFilter, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Agar toast setup hai toh use karein

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLead = async (id) => {
    if (window.confirm("Bhai, kya aap waqai ye lead delete karna chahte hain?")) {
      try {
        const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
        if (res.ok) {
          setLeads(leads.filter(l => l._id !== id));
          toast?.success("Record Deleted Successfully");
        }
      } catch (error) {
        toast?.error("Error deleting record");
      }
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "All" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Closed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Hot Lead": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Warm Lead": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Call Booked": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Cancelled": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-sky-50 text-sky-600 border-sky-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <div className="p-4 md:p-8 lg:p-10 max-w-[1500px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3">
               <div className="p-3 bg-[#12066a] rounded-2xl text-white shadow-lg shadow-indigo-200">
                 <LayoutGrid size={24} />
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-[#12066a] tracking-tight italic uppercase">Lead Management</h1>
            </div>
            <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-[0.3em] ml-1">
              Live Pipeline • {filteredLeads.length} Records Active
            </p>
          </div>
          <Link href="/" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12066a] text-white px-8 py-4 rounded-[1.3rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all active:scale-95">
            <UserPlus size={18} /> Add New Prospect
          </Link>
        </div>

        {/* Controls: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#12066a] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by client name, email or company..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:border-[#12066a] shadow-sm font-semibold transition-all text-sm placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-2 rounded-[1.5rem] shadow-sm border border-slate-100 min-w-[220px]">
            <ListFilter size={18} className="text-[#12066a]" />
            <select
              className="bg-transparent font-black text-xs uppercase tracking-widest outline-none cursor-pointer w-full py-3"
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

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-indigo-900" size={40} />
              <p className="font-black text-xs text-slate-300 uppercase tracking-widest">Synchronizing Database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    <th className="p-8">Client Information</th>
                    <th className="p-8 text-center">Service Type</th>
                    <th className="p-8 text-center">Pipeline Value</th>
                    <th className="p-8 text-center">Status Badge</th>
                    <th className="p-8 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="p-8">
                        <p className="font-black text-[#12066a] text-xl italic tracking-tight group-hover:translate-x-1 transition-transform">{lead.clientName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 size={12} className="text-slate-300" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{lead.companyName || "Independent Client"}</p>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <span className="text-[10px] font-black bg-slate-100 px-4 py-2 rounded-xl text-slate-600 uppercase tracking-wider">{lead.service}</span>
                      </td>
                      <td className="p-8 text-center font-black text-[#12066a] text-2xl italic tracking-tighter">
                        £{Number(lead.value || 0).toLocaleString()}
                      </td>
                      <td className="p-8 text-center">
                        <span className={`text-[9px] font-black px-4 py-2 rounded-full border uppercase tracking-widest ${getStatusStyle(lead.status)} shadow-sm`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button 
                          onClick={() => deleteLead(lead._id)} 
                          className="p-4 text-red-500 hover:text-rose-700 hover:bg-rose-50 rounded-[1.2rem] transition-all active:scale-90"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredLeads.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                <Search size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-300 font-black italic uppercase tracking-[0.3em] text-sm">No Matching Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}