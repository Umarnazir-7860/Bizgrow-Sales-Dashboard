"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Building2, Phone, Mail, Receipt} from "lucide-react"; 
import { useRouter } from "next/navigation"; 

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    email: "",
    phone: "",
    service: "SIA ACS",
    value: "",
    status: "Cold Lead",
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("API issues");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch leads failed:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({
        clientName: "",
        companyName: "",
        email: "",
        phone: "",
        service: "SIA ACS",
        value: "",
        status: "Cold Lead",
      });
      fetchLeads();
    }
  };

  const deleteLead = async (id) => {
    if (confirm("Delete this lead?")) {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      fetchLeads();
    }
  };

  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchLeads();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Closed": return "bg-green-100 text-green-700 border-green-200";
      case "Hot Lead": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Call Booked": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Warm Lead": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-zinc-50 min-h-screen text-zinc-900 font-sans">

      {/* 🔹 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-14 md:mt-0 gap-6 mb-10">
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-md hover:shadow-lg transition-shadow duration-300">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Total Prospects</p>
          {loading ? (
            <div className="h-10 w-24 bg-zinc-100 animate-pulse rounded-lg" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold">{leads.length}</p>
          )}
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-md hover:shadow-lg transition-shadow duration-300">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Pipeline Value</p>
          {loading ? (
            <div className="h-10 w-32 bg-zinc-100 animate-pulse rounded-lg" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold">
              £{leads.reduce((a, b) => a + (Number(b.value) || 0), 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* FORM */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-md lg:sticky lg:top-8">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-[#12066a] flex items-center gap-2">
            Add New Prospect
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Client Name" className="w-full p-4 bg-zinc-50 border rounded-2xl outline-none focus:border-[#12066a] transition-colors" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} />
            <input placeholder="Company Name" className="w-full p-4 bg-zinc-50 border rounded-2xl outline-none focus:border-[#12066a] transition-colors" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input placeholder="Email" className="w-full p-4 bg-zinc-50 border rounded-2xl outline-none focus:border-[#12066a] text-sm transition-colors" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input placeholder="Phone" className="w-full p-4 bg-zinc-50 border rounded-2xl outline-none focus:border-[#12066a] text-sm transition-colors" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <select className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold text-sm outline-none focus:border-[#12066a] transition-colors" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}>
              <option value="SIA ACS">SIA ACS</option>
              <option value="ISO 9001">ISO 9001</option>
              <option value="ISO 14001">ISO 14001</option>
              <option value="ISO 45001">ISO 45001</option>
              <option value="ISO 27001">ISO 27001</option>
            </select>

            <select className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold text-sm text-[#12066a] outline-none focus:border-[#12066a] transition-colors" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="Cold Lead">Cold Lead</option>
              <option value="Warm Lead">Warm Lead</option>
              <option value="Hot Lead">Hot Lead</option>
              <option value="Call Booked">Call Booked</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <input required type="number" placeholder="Value £" className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold outline-none focus:border-[#12066a] transition-colors" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />

            <button type="submit" className="w-full bg-[#12066a] text-white py-4 rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-lg hover:bg-blue-900 transition-all">
              Record Prospect
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="col-span-12 lg:col-span-8">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-6">Sales Pipeline</h2>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-4 sm:p-6 rounded-[2rem] border border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"></div>
              ))
            ) : leads.length === 0 ? (
              <div className="bg-white p-6 sm:p-12 rounded-[2rem] border border-dashed border-zinc-300 text-center">
                <p className="text-zinc-400 font-bold">No prospects found. Add your first lead!</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead._id} className="bg-white p-4 sm:p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#12066a] transition-all group">
                  
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#12066a] text-white rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl">
                      {lead.clientName ? lead.clientName[0] : "P"}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-base sm:text-lg text-zinc-900">{lead.clientName}</h3>

                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer outline-none ${getStatusStyle(lead.status)}`}
                        >
                          <option value="Cold Lead">Cold Lead</option>
                          <option value="Warm Lead">Warm Lead</option>
                          <option value="Hot Lead">Hot Lead</option>
                          <option value="Call Booked">Call Booked</option>
                          <option value="Closed">Closed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        {lead.status === "Closed" && (
                          <button
                            onClick={() => {
                              localStorage.setItem(
                                "pendingInvoice",
                                JSON.stringify({ name: lead.clientName, amount: lead.value, company: lead.companyName || "", service: lead.service })
                              );
                              router.push("/invoices");
                            }}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95"
                          >
                            <Receipt size={12} /> Generate Invoice
                          </button>
                        )}
                      </div>

                      <div className="mt-1 text-[10px] text-zinc-700 font-bold uppercase flex items-center gap-1">
                        <Building2 size={12} /> {lead.companyName || "N/A"}
                      </div>

                      <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-700">
                        <span className="flex items-center gap-1"><Mail size={12} className="text-[#12066a]" /> {lead.email || "No Email"}</span>
                        <span className="flex items-center gap-1"><Phone size={12} className="text-[#12066a]" /> {lead.phone || "No Phone"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <div className="text-lg sm:text-xl font-black text-[#12066a]">
                        £{Number(lead.value).toLocaleString()}
                      </div>
                      <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                        {lead.service}
                      </span>
                    </div>

                    <button onClick={() => deleteLead(lead._id)} className="text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
