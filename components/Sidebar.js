"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  PieChart,
  Settings,
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

  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-[#12066a] text-white border-r border-white/5 z-50 shadow-2xl">
      
      {/* Main Wrapper with Padding */}
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
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group",
        "hover:bg-white hover:text-black", // Non-active links ke liye simple hover
        isActive 
          ? "bg-[#997819] text-white shadow-[0_10px_20px_rgba(153,120,25,0.3)] scale-[1.02]" 
          : "text-white/70"
      )}
    >
      <Icon 
        size={18} 
        className={cn(
          "transition-transform group-hover:scale-110",
          // Yahan magic hai: 
          // 1. Default color text-white/40
          // 2. Agar active hai toh text-white
          // 3. Lekin jab bhi group (Link) hover ho, toh text-black ho jaye
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
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Administrator</p>
          </div>
        </div>

      </div>
    </aside>
  );
}