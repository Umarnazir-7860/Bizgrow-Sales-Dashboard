"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Receipt, Download, Trash2, PlusCircle, Building2, User, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    invoiceNumber: "AUTO-GENERATE",
    clientCompanyName: "",
    clientName: "",
    clientAddress: "",
    items: [{ serviceName: "", price: "", quantity: 1, taxRate: 20 }],
    issueDate: new Date().toISOString().split('T')[0], 
    dueDate: "", 
    status: "Unpaid",
  });

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      if (data.nextInvoiceNumber) {
        setFormData(prev => ({ ...prev, invoiceNumber: data.nextInvoiceNumber }));
      }
    } catch (error) { console.error("Fetch error:", error); }
  };

  useEffect(() => {
    const name = searchParams.get("name");
    const amount = searchParams.get("amount");
    const company = searchParams.get("company");
    const service = searchParams.get("service") || "Professional Services";

    if (name || amount || company) {
      setShowForm(true);
      setFormData(prev => ({
        ...prev,
        clientName: name || "",
        clientCompanyName: company || "",
        items: [{ 
          serviceName: service, 
          price: amount || "", 
          quantity: 1, 
          taxRate: 20, 
        }],
      }));
    }
    fetchInvoices();
  }, [searchParams]);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { serviceName: "", price: "", quantity: 1, taxRate: 20 }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const getTotals = (items) => {
    let sub = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    let tax = sub * 0.20;
    return { sub, tax, total: sub + tax };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totals = getTotals(formData.items);
    
    // Data with calculations for Backend
    const dataToSave = {
      ...formData,
      subtotal: totals.sub,
      taxAmount: totals.tax,
      totalAmount: totals.total,
      amount: totals.total.toString() // For your DB field
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        const savedInvoice = await res.json();
        setShowForm(false);
        setFormData({
          invoiceNumber: "AUTO-GENERATE", clientCompanyName: "", clientName: "", clientAddress: "",
          items: [{ serviceName: "", price: "", quantity: 1, taxRate: 20 }],
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: "",
          status: "Unpaid",
        });
        await fetchInvoices(); 
        generatePDF(savedInvoice); 
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) { alert("Submission failed."); }
  };

  const deleteInvoice = async (id) => {
    if (confirm("Delete this invoice?")) {
      await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
      fetchInvoices();
    }
  };

const generatePDF = async (inv) => {
  try {
    const doc = new jsPDF();
    
    // --- 1. Header ---
    doc.setFontSize(22); doc.setTextColor(18, 6, 106); doc.setFont(undefined, 'bold');
    doc.text("INVOICE", 14, 20);
    doc.setFontSize(10); doc.setTextColor(0); 
    doc.text("BizGrow Holdings Ltd", 14, 30);
    doc.setFont(undefined, 'normal');
    doc.text(["+44 7898205035", "Cranbrook House, 61", "Ilford, Essex, IG1 4PG", "https://bizgrow-holdings.com/"], 14, 35);

    // --- 2. Client Info ---
    doc.setFont(undefined, 'bold'); doc.text("BILLED TO:", 14, 60);
    doc.setFontSize(11); doc.text(inv.clientCompanyName || "Valued Client", 14, 67);
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text(`${inv.clientName || ""}`, 14, 73);
    doc.text(inv.clientAddress || "Address details not provided", 14, 78, { maxWidth: 100 });

    // --- 3. Meta Info ---
    doc.setFont(undefined, 'bold'); doc.text("Invoice Number:", 130, 60);
    doc.text("Issue Date:", 130, 66);
    doc.text("Due Date:", 130, 72);
    doc.setFont(undefined, 'normal');
    doc.text(inv.invoiceNumber || "N/A", 170, 60);
    
    const formatDt = (d) => d ? new Date(d).toLocaleDateString('en-GB') : "N/A";
    doc.text(formatDt(inv.createdAt || inv.date), 170, 66); // Issue date from createdAt
    doc.text(formatDt(inv.dueDate), 170, 72);

    // --- 4. Table Logic (Smart Backup) ---
    let tableRows = [];
    let subTotal = 0;

    if (inv.items && inv.items.length > 0) {
      // Agar items hain (Normal Flow)
      tableRows = inv.items.map(i => {
        const p = parseFloat(i.price) || 0;
        const q = parseInt(i.quantity) || 1;
        return [i.serviceName, `£${p.toFixed(2)}`, q, "20%", `£${(p * q).toFixed(2)}` ];
      });
      subTotal = inv.items.reduce((acc, i) => acc + (parseFloat(i.price || 0) * parseInt(i.quantity || 1)), 0);
    } else {
      // ✨ BACKUP: Agar items nahi hain, toh main 'amount' use karo
      const totalAmt = parseFloat(inv.amount || inv.totalAmount || 0);
      subTotal = totalAmt / 1.2; // Back-calculating subtotal from 20% VAT
      tableRows = [[ "Professional Services", `£${subTotal.toFixed(2)}`, "1", "20%", `£${subTotal.toFixed(2)}` ]];
    }

    autoTable(doc, {
      startY: 95,
      head: [["Description", "Price", "Qty", "VAT", "Total"]],
      body: tableRows,
      headStyles: { fillColor: [18, 6, 106] },
    });

    // --- 5. Totals (Forced Calculation) ---
    const finalY = doc.lastAutoTable.finalY + 10;
    const vatAmount = subTotal * 0.20;
    const grandTotal = subTotal + vatAmount;

    doc.setFont(undefined, 'bold');
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`£${subTotal.toFixed(2)}`, 195, finalY, { align: 'right' });
    
    doc.text(`VAT (20%):`, 140, finalY + 7);
    doc.text(`£${vatAmount.toFixed(2)}`, 195, finalY + 7, { align: 'right' });

    doc.setFontSize(12);
    doc.setTextColor(18, 6, 106);
    doc.text(`Total Due (GBP):`, 140, finalY + 16);
    doc.text(`£${grandTotal.toFixed(2)}`, 195, finalY + 16, { align: 'right' });

    // --- 6. Terms & Conditions Page ---
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(18, 6, 106);
    doc.setFont(undefined, 'bold');
    doc.text("Terms & Notes:", 14, 20);
    
    doc.setFontSize(12);
    doc.text("Terms and Conditions", 14, 30);
    
    doc.setFontSize(7.5); // Chota font taake poora text fit ho jaye
    doc.setTextColor(60);
    doc.setFont(undefined, 'normal');

    const fullTerms = `
Introduction
These Terms and Conditions ("Terms") govern the relationship and serve as a binding agreement between Bizgrow Holding Ltd ("we", "us", "our"), a company registered in England and Wales under company registration no. 14026241 and the Client ("you", "your") for the provision of business consultancy services ("Services") as detailed in our formal quotation or proposal.

Acceptance
By accepting our quotation, either explicitly or by implication through the initiation of Services, you agree to be bound by these Terms, which, along with our quotation, constitute the entire agreement between us.

Interpretation
"Business Day": Refers to any day other than a Saturday, Sunday, or public holiday in the jurisdiction where our Services are provided. Headings are for reference only. Singular terms include plurals and vice versa.

Scope of Services
We will perform the Services with due care, skill, and professionalism. We reserve the right to modify Services to adhere to statutory or safety requirements. Completion timelines are estimates and not guaranteed.

Client Obligations
You must ensure all necessary consents, permissions, and access to pertinent information are provided. Failure to meet these may lead to termination or suspension of Services.

Fees and Expenses
Our fees are based on time and materials. Additional expenses like travel, accommodation, and third-party costs are chargeable. Third-party certifications or memberships are your responsibility and must be paid directly or reimbursed.

Payment Terms
Payment is typically due within 7 business days of invoicing. Late payments accrue interest at 10% per annum above the Bank of England base rate. Refunds can be requested within 14 days of payment but not after work has started or been delivered.

Amendments and Cancellations
We reserve the right to amend or withdraw a quotation within 7 business days. Cancellations or changes may incur additional costs.

Liability and Indemnity
Our liability is limited to the total amount of Fees paid by you. We are not liable for indirect losses, lost profits, or data loss. You must indemnify us against damages arising from loss or damage to equipment caused by you or your agents.

Intellectual Property Rights
All intellectual property rights in materials provided remain our property. You are granted a license for use related to the Services only.

Data Protection and Confidentiality
Both parties agree to maintain confidentiality and comply with applicable data protection laws.

Force Majeure
Neither party is liable for failure or delay due to causes beyond reasonable control (fire, flood, civil unrest, etc.). If delay continues for 90 days, either party may terminate.

Governing Law
These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
    `;

    // Text ko automatically wrap karne ke liye
    const splitTerms = doc.splitTextToSize(fullTerms, 180);
    doc.text(splitTerms, 14, 38);

    // --- Save the PDF ---
    doc.save(`${inv.invoiceNumber || 'invoice'}.pdf`);
  } catch (e) {
    console.error("PDF ERROR:", e);
    alert("PDF Error: Check console.");
  }
};

  return (
    <div className="p-8 bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#12066a] tracking-tight">Invoices</h1>
          <p className="text-zinc-500 font-medium">Automated Billing System</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#12066a] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl transition-all active:scale-95">
          {showForm ? "Close" : <><Plus size={20} /> Create Invoice</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[#12066a] shadow-2xl mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input required placeholder="Client Company" className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold" value={formData.clientCompanyName} onChange={e => setFormData({...formData, clientCompanyName: e.target.value})} />
                <input required placeholder="Contact Person" className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                
                {/* DATE SELECTION FIELDS */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase ml-2">Issue Date</label>
                     <input type="date" required className="p-4 bg-zinc-50 border rounded-2xl font-bold" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase ml-2">Due Date</label>
                     <input type="date" required className="p-4 bg-zinc-50 border rounded-2xl font-bold" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                   </div>
                </div>
              </div>
              <textarea placeholder="Full Address" className="p-4 bg-zinc-50 border rounded-2xl font-bold h-full" value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} />
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-center bg-zinc-50 p-4 rounded-2xl border">
                  <input required placeholder="Service" className="flex-1 p-2 bg-white border rounded-xl font-bold" value={item.serviceName} onChange={e => updateItem(index, 'serviceName', e.target.value)} />
                  <input required type="number" placeholder="Price" className="w-24 p-2 bg-white border rounded-xl font-bold" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} />
                  <input required type="number" placeholder="Qty" className="w-16 p-2 bg-white border rounded-xl font-bold text-center" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                  {formData.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-red-500"><Trash2 size={18}/></button>}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-[#12066a] font-bold text-xs flex items-center gap-1"><PlusCircle size={16}/> Add Service</button>
            </div>

            <div className="flex justify-between items-center bg-[#12066a] p-8 rounded-[2rem]">
              <div className="text-white">
                <p className="text-xs opacity-70">Total Amount</p>
                <p className="text-3xl font-black">£{getTotals(formData.items).total.toFixed(2)}</p>
              </div>
              <button type="submit" className="bg-white text-[#12066a] px-10 py-4 rounded-xl font-black uppercase text-xs">Save & Print</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-100 border-b">
            <tr>
              <th className="p-6 text-[10px] font-bold uppercase text-zinc-400">Invoice Details</th>
              <th className="p-6 text-[10px] font-bold uppercase text-zinc-400">Total (Gross)</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-zinc-50/50">
                <td className="p-6">
                  <div className="font-black text-[#12066a]">{inv.invoiceNumber}</div>
                  <div className="text-xs text-zinc-400 font-bold">{inv.clientCompanyName || inv.clientName}</div>
                </td>
                <td className="p-6 font-black text-lg">£{Number(inv.totalAmount || inv.amount || 0).toFixed(2)}</td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => generatePDF(inv)} className="p-3 text-blue-600"><Download size={20}/></button>
                    <button onClick={() => deleteInvoice(inv._id)} className="p-3 text-red-500"><Trash2 size={20}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}