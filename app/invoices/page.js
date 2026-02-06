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
      
      // 1. Header
      doc.setFontSize(22); doc.setTextColor(18, 6, 106); doc.setFont(undefined, 'bold');
      doc.text("INVOICE", 14, 20);
      doc.setFontSize(10); doc.setTextColor(0); 
      doc.text("BizGrow Holdings Ltd", 14, 30);
      doc.setFont(undefined, 'normal');
      doc.text(["+44 7898205035", "Cranbrook House, 61", "Ilford, Essex, IG1 4PG", "https://bizgrow-holdings.com/"], 14, 35);

      // 2. Client Info
      doc.setFont(undefined, 'bold'); doc.text("BILLED TO:", 14, 60);
      doc.setFontSize(11); doc.text(inv.clientCompanyName || "N/A", 14, 67);
      doc.setFontSize(10); doc.setFont(undefined, 'normal');
      doc.text(`${inv.clientName}\n${inv.clientAddress}`, 14, 73);

      // 3. Meta Info (Dates)
      doc.setFont(undefined, 'bold'); doc.text("Invoice Number:", 130, 60);
      doc.text("Issue Date:", 130, 66);
      doc.text("Due Date:", 130, 72);
      doc.setFont(undefined, 'normal');
      doc.text(inv.invoiceNumber, 170, 60);
      doc.text(new Date(inv.issueDate).toLocaleDateString('en-GB'), 170, 66);
      doc.text(new Date(inv.dueDate).toLocaleDateString('en-GB'), 170, 72);

      // 4. Table
      autoTable(doc, {
        startY: 90,
        head: [["Description", "Price", "Qty", "VAT", "Total"]],
        body: (inv.items || []).map(i => [
          i.serviceName, 
          `£${Number(i.price).toFixed(2)}`, 
          i.quantity, 
          "20%", 
          `£${(Number(i.price) * Number(i.quantity)).toFixed(2)}`
        ]),
        headStyles: { fillColor: [18, 6, 106] },
      });

      // 5. Totals (Calculation from items to avoid £0 error)
      const finalY = doc.lastAutoTable.finalY + 10;
      const sub = (inv.items || []).reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
      const vat = sub * 0.20;
      const total = sub + vat;

      doc.setFont(undefined, 'bold');
      doc.text(`Subtotal: £${sub.toFixed(2)}`, 140, finalY);
      doc.text(`VAT (20%): £${vat.toFixed(2)}`, 140, finalY + 7);
      doc.setFontSize(12);
      doc.text(`Total Due: £${total.toFixed(2)}`, 140, finalY + 15);

      // Terms Page
      doc.addPage();
      doc.setFontSize(14); doc.text("Terms and Conditions", 14, 20);
      doc.setFontSize(8); doc.setFont(undefined, 'normal');
      doc.text("1. Introduction: These Terms govern the relationship between Bizgrow Holding Ltd and the Client...", 14, 30);

      doc.save(`${inv.invoiceNumber}.pdf`);
    } catch (e) { alert("Error generating PDF."); }
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