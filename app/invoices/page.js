"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Receipt, Download, Trash2 } from "lucide-react";
// PDF Libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    clientName: "",
    amount: "",
    status: "Unpaid",
    dueDate: ""
  });

  useEffect(() => {
    const name = searchParams.get("name");
    const amount = searchParams.get("amount");

    if (name || amount) {
      setShowForm(true);
      setFormData(prev => ({
        ...prev,
        clientName: name || "",
        amount: amount || "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
    fetchInvoices();
  }, [searchParams]);

  // --- 🚀 DYNAMIC PDF GENERATION (Settings Linked) ---
  const generatePDF = async (inv) => {
    try {
      // Step 1: Fetch current settings from DB
      const settingsRes = await fetch("/api/settings");
      const settings = await settingsRes.json();

      const doc = new jsPDF();
      const primaryColor = [18, 6, 106]; // #12066a
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("INVOICE", 14, 20);
      
      // Company Info (Now from Settings)
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Business: ${settings.businessName || "Bizgrow Holdings"}`, 14, 30);
      doc.text(`Email: ${settings.email || "info@bizgrow-holdings.com"}`, 14, 35);
      
      // Client Info
      doc.setTextColor(0);
      doc.setFont(undefined, 'bold');
      doc.text("BILL TO:", 14, 55);
      doc.setFont(undefined, 'normal');
      doc.text(`Client: ${inv.clientName}`, 14, 62);
      doc.text(`Invoice #: ${inv.invoiceNumber}`, 14, 67);
      
      const cleanDate = new Date(inv.dueDate).toLocaleDateString('en-GB');
      doc.text(`Due Date: ${cleanDate}`, 14, 72);

      // Main Table
      autoTable(doc, {
        startY: 80,
        head: [["Description", "Amount"]],
        body: [
          [`Professional Services rendered to ${inv.clientName}`, `GBP ${Number(inv.amount).toLocaleString()}`]
        ],
        headStyles: { fillColor: primaryColor },
        theme: 'grid'
      });

      // Total & Bank Section
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFont(undefined, 'bold');
      doc.text(`Total Amount: GBP ${Number(inv.amount).toLocaleString()}`, 14, finalY);
      
      // Bank Details (Live from your Settings Page)
      doc.setFontSize(12);
      doc.text("BANK DETAILS FOR PAYMENT:", 14, finalY + 15);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Bank Name: ${settings.bankName || "N/A"}`, 14, finalY + 22);
      doc.text(`Account Name: ${settings.accountName || "N/A"}`, 14, finalY + 27);
      doc.text(`Account Number: ${settings.accountNumber || "N/A"}`, 14, finalY + 32);
      doc.text(`Sort Code: ${settings.sortCode || "N/A"}`, 14, finalY + 37);
      
      if (inv.status === "Paid") {
        doc.setTextColor(0, 150, 0);
        doc.setFont(undefined, 'bold');
        doc.text("STATUS: PAID & RECEIVED", 14, finalY + 50);
      }

      doc.save(`${inv.invoiceNumber}_${inv.clientName}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Error loading invoice settings.");
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Fetch error:", error); }
  };

  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`/api/invoices?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchInvoices();
  };

  const deleteInvoice = async (id) => {
    if (confirm("Delete this invoice?")) {
      const res = await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchInvoices();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: "", amount: "", status: "Unpaid", dueDate: ""
      });
      fetchInvoices();
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700 border-green-200";
      case "Overdue": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="p-8 bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#12066a] tracking-tight">Invoices</h1>
          <p className="text-zinc-500 font-medium">Tracking payments and revenue</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#12066a] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-900 shadow-lg transition-all active:scale-95">
          {showForm ? "Close Form" : <><Plus size={20} /> Create Invoice</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
          <p className="text-2xl font-black text-amber-600">£{invoices.filter(i => i.status !== "Paid").reduce((a, b) => a + (Number(b.amount) || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Revenue Collected</p>
          <p className="text-2xl font-black text-green-600">£{invoices.filter(i => i.status === "Paid").reduce((a, b) => a + (Number(b.amount) || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {showForm && (
          <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[2rem] border-2 border-[#12066a] shadow-2xl h-fit animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black mb-6 text-[#12066a] flex items-center gap-2"><Receipt size={24} /> New Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Invoice Number</label>
                <input readOnly className="w-full p-4 bg-zinc-100 border rounded-2xl font-bold text-zinc-500" value={formData.invoiceNumber} />
              </div>
              <input required placeholder="Client Name" className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
              <input required type="number" placeholder="Amount £" className="w-full p-4 bg-zinc-50 border rounded-2xl font-black text-lg" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              <input required type="date" className="w-full p-4 bg-zinc-50 border rounded-2xl" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              <button type="submit" className="w-full bg-[#12066a] text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-900 shadow-md">Save & Generate</button>
            </form>
          </div>
        )}

        <div className={`${showForm ? 'lg:col-span-8' : 'col-span-12'} transition-all duration-500`}>
          <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b">
                  <th className="p-6 text-[10px] font-bold uppercase text-zinc-400">Invoice Info</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-zinc-400">Amount</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-zinc-400">Status</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-zinc-50/50 group transition-colors">
                    <td className="p-6 text-sm font-black">
                      {inv.invoiceNumber} 
                      <br/>
                      <span className="text-xs text-zinc-400 font-medium">{inv.clientName}</span>
                    </td>
                    <td className="p-6 font-black text-[#12066a]">£{Number(inv.amount).toLocaleString()}</td>
                    <td className="p-6">
                      <select 
                        value={inv.status} 
                        onChange={(e) => updateStatus(inv._id, e.target.value)} 
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border cursor-pointer outline-none ${getStatusStyle(inv.status)}`}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => generatePDF(inv)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Download PDF">
                          <Download size={18} />
                        </button>
                        <button onClick={() => deleteInvoice(inv._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <div className="p-20 text-center text-zinc-300 font-bold uppercase text-xs tracking-widest">No invoices to display</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black animate-pulse text-[#12066a]">INITIALIZING SYSTEM...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}