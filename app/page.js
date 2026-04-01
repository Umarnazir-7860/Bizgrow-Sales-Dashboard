"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Building2, Phone, Mail, Wallet, Users, PlusCircle, LayoutDashboard, Briefcase, Receipt } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    clientName: "", companyName: "", email: "", phone: "", service: "SIA ACS", value: "", status: "Cold Lead",
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads", { cache: 'no-store' });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) { setLeads([]); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      toast.success("Lead added successfully!");
      setFormData({ clientName: "", companyName: "", email: "", phone: "", service: "SIA ACS", value: "", status: "Cold Lead" });
      fetchLeads();
    }
  };

  const updateStatus = async (id, newStatus) => {
    const updatedLeads = leads.map(l => l._id === id ? { ...l, status: newStatus } : l);
    setLeads(updatedLeads);
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) toast.info(`Status changed to ${newStatus}`);
  };

  const handleDeleteRequest = (id, name) => {
    toast.error(`Delete lead for ${name}?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success("Lead deleted successfully");
            fetchLeads();
          } else {
            toast.error("Failed to delete lead");
          }
        },
      },
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Closed": return "bg-green-100 text-green-700 border-green-200";
      case "Hot Lead": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Call Booked": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Warm Lead": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-[#f8fafc] min-h-screen text-zinc-900 font-sans">
      <Toaster position="top-center" richColors closeButton />
      
      <div className="max-w-7xl mx-auto">
        
        {/* 🔹 Header & Stats Row */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#12066a] tracking-tight flex items-center gap-3">
              <LayoutDashboard size={32} /> CRM Dashboard
            </h1>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mt-1 ml-1">BizGrow Management System</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-xl text-[#12066a]"><Users size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase leading-none">Total</p>
                <p className="text-xl font-black text-[#12066a]">{leads.length}</p>
              </div>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="p-2 bg-amber-50 rounded-xl text-[#997819]"><Wallet size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase leading-none">Pipeline</p>
                <p className="text-xl font-black text-[#12066a]">£{leads.reduce((a, b) => a + (Number(b.value) || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 MAIN PIPELINE LIST */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 ml-2">
            <Briefcase size={18} className="text-[#997819]" />
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Active Sales Pipeline</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {leads.length > 0 ? leads.map((lead) => (
              <div key={lead._id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center justify-between hover:border-[#12066a]/20 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className="w-12 h-12 bg-zinc-50 text-[#12066a] rounded-xl flex items-center justify-center font-black text-lg border border-zinc-100">
                    {lead.clientName ? lead.clientName[0] : "P"}
                  </div>
                  <div>
                    <h3 className="font-black text-[#12066a] text-md leading-tight">{lead.clientName}</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase flex items-center gap-1 mt-0.5"><Building2 size={10} className="text-[#12066a]" /> {lead.companyName || "Private"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full md:w-2/3 justify-between md:justify-end mt-4 md:mt-0">
                  <div className="hidden xl:flex flex-col gap-1 text-right mr-4">
                    <span className="text-[10px] text-zinc-400 flex items-center justify-end gap-1.5 font-medium"><Mail size={10} /> {lead.email || "N/A"}</span>
                    <span className="text-[10px] text-zinc-400 flex items-center justify-end gap-1.5 font-medium"><Phone size={10} /> {lead.phone || "N/A"}</span>
                  </div>

                  {/* Generate Invoice Button (Visible only if status is Closed) */}
                  {lead.status === "Closed" && (
                    <button
                      onClick={() => {
                        const invoiceData = {
                          name: lead.clientName,
                          company: lead.companyName,
                          amount: lead.value,
                          service: lead.service
                        };
                        localStorage.setItem("pendingInvoice", JSON.stringify(invoiceData));
                        window.location.href = "/invoices";
                      }}
                      className="bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm transition-all active:scale-95 animate-in fade-in slide-in-from-right-2"
                    >
                      <Receipt size={12} /> Generate Invoice
                    </button>
                  )}

                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead._id, e.target.value)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border cursor-pointer outline-none transition-all ${getStatusStyle(lead.status)}`}
                  >
                    {["Cold Lead", "Warm Lead", "Hot Lead", "Call Booked", "Closed", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <div className="text-right min-w-[100px]">
                    <p className="font-black text-[#12066a] text-lg tracking-tighter italic leading-none">£{Number(lead.value).toLocaleString()}</p>
                    <span className="text-[8px] font-black text-[#997819] uppercase tracking-widest">{lead.service}</span>
                  </div>

                  <button onClick={() => handleDeleteRequest(lead._id, lead.clientName)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-zinc-100 text-zinc-300 font-bold uppercase tracking-widest">Pipeline Empty</div>
            )}
          </div>
        </div>

        {/* 🔹 BOTTOM FORM */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-blue-900/5 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle className="text-[#12066a]" size={22} />
            <h2 className="text-xl font-black text-[#12066a] tracking-tight">Record New Prospect</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input required placeholder="Client Full Name" className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl outline-none focus:border-[#12066a] focus:bg-white text-sm font-semibold transition-all" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} />
            <input placeholder="Company Name" className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl outline-none focus:border-[#12066a] focus:bg-white text-sm font-semibold transition-all" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
            <input placeholder="Email Address" className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl outline-none focus:border-[#12066a] focus:bg-white text-sm font-semibold transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input placeholder="Phone" className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl outline-none focus:border-[#12066a] focus:bg-white text-sm font-semibold transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            
            <select className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl font-bold text-sm outline-none focus:border-[#12066a] cursor-pointer" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}>
              {["SIA ACS", "ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <select className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl font-bold text-sm outline-none focus:border-[#12066a] cursor-pointer" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              {["Cold Lead", "Warm Lead", "Hot Lead", "Call Booked", "Closed", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">£</span>
              <input required type="number" placeholder="Value" className="w-full pl-8 pr-5 py-3.5 bg-zinc-50 border border-transparent rounded-2xl font-black text-[#12066a] outline-none focus:border-[#12066a]" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
            </div>

            <button type="submit" className="w-full bg-[#12066a] text-white py-3.5 rounded-2xl font-black uppercase tracking-[0.1em] text-xs shadow-lg shadow-blue-900/20 hover:bg-[#1a0b8a] transition-all active:scale-95">
              Add to Pipeline
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}