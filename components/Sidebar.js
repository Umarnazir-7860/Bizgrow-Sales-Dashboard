"use client";

import React, { useState } from "react"; // 🔹 State add ki
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  PieChart,
  Settings,
  Menu, // 🔹 Icons add kiye
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Leads", icon: Users, href: "/leads" },
  { name: "Invoices", icon: FileText, href: "/invoices" },
  { name: "Analytics", icon: PieChart, href: "/analytics" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // 🔹 Mobile toggle state

  return (
    <>
      {/* 🔹 1. Mobile Toggle Button (Sirf mobile par dikhega) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-2 z-[60] p-3 bg-[#12066a] text-white rounded-2xl shadow-xl active:scale-95 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 🔹 2. Backdrop (Mobile par jab menu khulay to background dark ho jaye) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔹 3. Main Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen bg-[#12066a] text-white border-r border-white/5 z-50 shadow-2xl transition-transform duration-300",
        "w-72 lg:translate-x-0", // Desktop settings
        isOpen ? "translate-x-0" : "-translate-x-full" // Mobile settings (Show/Hide)
      )}>
        
        <div className="h-full flex flex-col p-8"> 

          {/* Branding Area */}
          <div className="mb-12 px-2">
            <h2 className="text-2xl font-black tracking-tighter leading-none">
              BIZGROW
            </h2>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-1 font-bold">
              Sales Console
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // 🔹 Link click hotay hi menu band ho jaye
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group",
                    "hover:bg-white hover:text-black",
                    isActive 
                      ? "bg-[#997819] text-white shadow-[0_10px_20px_rgba(153,120,25,0.3)] scale-[1.02]" 
                      : "text-white/70"
                  )}
                >
                  <Icon 
                    size={18} 
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      "text-white/40 group-hover:text-black", 
                      isActive && "text-white" 
                    )} 
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#997819] to-[#12066a] flex items-center justify-center font-black text-sm border border-white/10">
              B
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Bizgrow</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-nowrap">Administrator</p>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}