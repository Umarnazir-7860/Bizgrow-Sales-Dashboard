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

  // ✨ SMOOTH LOGIC: LocalStorage + URL Handling
  useEffect(() => {
    const checkPendingData = () => {
      // 1. Pehle LocalStorage check karein (Clean URL approach)
      const savedData = localStorage.getItem("pendingInvoice");
      
      if (savedData) {
        const data = JSON.parse(savedData);
        fillForm(data.name, data.amount, data.company, data.service);
        localStorage.removeItem("pendingInvoice"); // Kaam khatam, storage saaf
        return;
      }

      // 2. Backup: Agar URL mein data hai (Old approach)
      const name = searchParams.get("name");
      const amount = searchParams.get("amount");
      const company = searchParams.get("company");
      const service = searchParams.get("service");

      if (name || amount || company) {
        fillForm(name, amount, company, service);
      }
    };

    const fillForm = (name, amount, company, service) => {
      setShowForm(true);
      setFormData(prev => ({
        ...prev,
        clientName: name || "",
        clientCompanyName: company || "",
        items: [{ 
          serviceName: service || "Professional Services", 
          price: amount || "", 
          quantity: 1, 
          taxRate: 20, 
        }],
      }));
    };

    checkPendingData();
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
    const dataToSave = {
      ...formData,
      subtotal: totals.sub,
      taxAmount: totals.tax,
      totalAmount: totals.total,
      amount: totals.total.toString()
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

    /* ================= LOGO ================= */
    const logo = "/bizgrow-logo.png";
    doc.addImage(logo, "PNG", 150, 10, 40, 20);

    /* ================= HEADER ================= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(18, 6, 106);
    doc.text("INVOICE", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text(
      [
        "BizGrow Holdings Ltd",
        "+44 7898 205035",
        "Cranbrook House, 61 Cranbrook Road",
        "Ilford, Essex, IG1 4PG, GB",
        "https://bizgrow-holdings.com/"
      ],
      14,
      32
    );

    /* ================= PAY BOX ================= */
    const formatDt = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "N/A";

    let subTotal = 0;
    if (inv.items?.length) {
      subTotal = inv.items.reduce(
        (a, i) => a + Number(i.price) * Number(i.quantity),
        0
      );
    } else {
      subTotal = Number(inv.amount || inv.totalAmount || 0) / 1.2;
    }

    const vat = subTotal * 0.2;
    const total = subTotal + vat;

    doc.setDrawColor(18, 6, 106);
    doc.setFillColor(245, 247, 255);
    doc.roundedRect(135, 40, 60, 20, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(18, 6, 106);
    doc.text(`Pay £${total.toFixed(2)}`, 165, 53, { align: "center" });

    /* ================= BILLED TO ================= */
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("BILLED TO", 14, 70);

    doc.setFont("helvetica", "bold");
    doc.text(inv.clientCompanyName || "Valued Client", 14, 77);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      doc.splitTextToSize(
        `${inv.clientName || ""}\n${inv.clientAddress || ""}`,
        80
      ),
      14,
      83
    );

    /* ================= META ================= */
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Number:", 130, 70);
    doc.text("Issue Date:", 130, 77);
    doc.text("Due Date:", 130, 84);

    doc.setFont("helvetica", "normal");
    doc.text(inv.invoiceNumber || "N/A", 170, 70);
    doc.text(formatDt(inv.issueDate || inv.createdAt), 170, 77);
    doc.text(formatDt(inv.dueDate), 170, 84);

    /* ================= TABLE ================= */
    const tableRows = inv.items?.length
      ? inv.items.map(i => [
          i.serviceName,
          `£${Number(i.price).toFixed(2)}`,
          i.quantity,
          "20%",
          `£${(Number(i.price) * Number(i.quantity)).toFixed(2)}`
        ])
      : [[
          "Professional Services",
          `£${subTotal.toFixed(2)}`,
          "1",
          "20%",
          `£${subTotal.toFixed(2)}`
        ]];

    autoTable(doc, {
      startY: 100,
      head: [["Item Name", "Price", "Qty", "VAT", "Subtotal"]],
      body: tableRows,
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [18, 6, 106],
        textColor: 255
      },
      alternateRowStyles: { fillColor: [245, 247, 255] }
    });

    /* ================= TOTALS ================= */
    const y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: £${subTotal.toFixed(2)}`, 195, y, { align: "right" });
    doc.text(`VAT (20%): £${vat.toFixed(2)}`, 195, y + 7, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(18, 6, 106);
    doc.text(`Amount Due (GBP): £${total.toFixed(2)}`, 195, y + 16, {
      align: "right"
    });

    /* ================= PAGE 2 TERMS ================= */
    doc.addPage();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(18, 6, 106);
    doc.text("Terms & Conditions", 14, 20);

    doc.setDrawColor(200);
    doc.line(14, 23, 195, 23);

    const terms = [
      ["Introduction", "These Terms govern the agreement between Bizgrow Holding Ltd and the Client."],
      ["Acceptance", "Proceeding with services constitutes acceptance of these Terms."],
      ["Fees & Payment", "Invoices are payable within 7 business days. Late payments accrue interest at 10%."],
      ["Liability", "Our liability is limited to the total fees paid under this contract."],
      ["Governing Law", "These Terms are governed by the laws of England and Wales."]
    ];

    let ty = 35;
    doc.setTextColor(50);

    terms.forEach(([title, body]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`• ${title}`, 14, ty);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(doc.splitTextToSize(body, 175), 18, ty + 5);

      ty += 18;
    });

    /* ================= SAVE ================= */
    doc.save(`${inv.invoiceNumber}.pdf`);

  } catch (e) {
    console.error(e);
    alert("PDF generation failed");
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
              <textarea placeholder="Full Address" className="p-4 bg-zinc-50 border rounded-2xl font-bold h-full min-h-[150px]" value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} />
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
                <p className="text-xs opacity-70">Total Amount (Inc. VAT)</p>
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
                    <button onClick={() => generatePDF(inv)} title="Download PDF" className="p-3 text-blue-600"><Download size={20}/></button>
                    <button onClick={() => deleteInvoice(inv._id)} title="Delete" className="p-3 text-red-500"><Trash2 size={20}/></button>
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