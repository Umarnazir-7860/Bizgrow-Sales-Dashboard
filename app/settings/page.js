"use client";
import React, { useState, useEffect } from "react";
import { Save, Building2, Landmark, Mail, Globe } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "",
    email: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    sortCode: "",
    currency: "GBP",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load Settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      alert("Settings saved successfully! ✅");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-[#12066a]">LOADING SETTINGS...</div>;

  return (
    <div className="p-8 bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#12066a] tracking-tight">Settings</h1>
          <p className="text-zinc-500 font-medium">Manage your business profile and bank details</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Business Profile */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-[#12066a]">
              <Building2 size={24} /> Business Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Business Name</label>
                <input
                  className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold focus:ring-2 ring-[#12066a] outline-none transition-all"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  placeholder="e.g. Bizgrow Holdings"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Business Email</label>
                <input
                  type="email"
                  className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold focus:ring-2 ring-[#12066a] outline-none transition-all"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="info@company.com"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-[#12066a]">
              <Landmark size={24} /> Bank Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Bank Name</label>
                <input
                  className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold focus:ring-2 ring-[#12066a] outline-none transition-all"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. Barclays Bank"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Account Name</label>
                <input
                  className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold focus:ring-2 ring-[#12066a] outline-none transition-all"
                  value={settings.accountName}
                  onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                  placeholder="Account Holder Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Account Number</label>
                <input
                  className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold focus:ring-2 ring-[#12066a] outline-none transition-all"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Sort Code</label>
                <input
                  className="w-full p-4 bg-zinc-50 border rounded-2xl font-bold focus:ring-2 ring-[#12066a] outline-none transition-all"
                  value={settings.sortCode}
                  onChange={(e) => setSettings({ ...settings, sortCode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#12066a] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all active:scale-[0.98] disabled:bg-zinc-400"
          >
            {saving ? "Saving..." : <><Save size={20} /> Update Settings</>}
          </button>
        </form>
      </div>
    </div>
  );
}