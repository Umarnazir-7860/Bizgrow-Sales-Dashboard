"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react"; 
import {
  LayoutDashboard,
  Users,
  FileText,
  PieChart,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- SUB-COMPONENT: PREMIUM LOGOUT MODAL ---
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-[#0a043c]/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-sm shadow-[0_30px_70px_rgba(0,0,0,0.4)] border border-indigo-50 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          
          <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-rose-200 rounded-[2.5rem] animate-ping opacity-20"></div>
            <LogOut size={36} className="text-rose-500 relative z-10" />
          </div>

          <h3 className="text-2xl font-black text-[#12066a] italic uppercase tracking-tighter mb-2">
            End Session?
          </h3>
          <p className="text-slate-400 text-[10px] font-bold leading-relaxed mb-8 px-4 uppercase tracking-widest">
            Are you sure you want to exit the Bizgrow Sales Console?
          </p>

          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onConfirm}
              className="w-full py-5 bg-rose-500 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all"
            >
              Confirm Logout
            </button>
            
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
            >
              Stay Connected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN SIDEBAR COMPONENT ---
const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Leads", icon: Users, href: "/leads" },
  { name: "Invoices", icon: FileText, href: "/invoices" },
  { name: "Analytics", icon: PieChart, href: "/analytics" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // 🔹 Navigation ke liye
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 🔹 LOGOUT LOGIC (REDIRECT TO LOGIN)
  const handleLogoutConfirm = async () => {
    try {
      // Step 1: Pehle modal close karein
      setShowLogoutModal(false);

      // Step 2: Session clear karein (Donon methods handle kiye hain)
      
      // Method A: Agar NextAuth use kar rahe ho (Best for Redirect)
      await signOut({ 
        redirect: true, 
        callbackUrl: "/login" 
      });

      // Method B: Agar Custom JWT hai (NextAuth nahi hai), to niche wala uncomment karein:
      /*
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
      router.refresh(); 
      */

    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-[70] p-4 bg-[#12066a] text-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(18,6,106,0.3)] active:scale-90 transition-all border border-white/10"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-[55] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen bg-[#0a043c] text-white border-r border-white/5 z-60 shadow-[20px_0_60px_rgba(0,0,0,0.2)] transition-all duration-500 ease-in-out",
        "w-[290px] lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        <div className="h-full flex flex-col pt-12 pb-8 px-6"> 

          {/* Branding Area */}
          <div className="mb-14 px-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#997819] to-amber-200 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(153,120,25,0.4)]">
              <ShieldCheck size={24} className="text-[#12066a]" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter leading-none italic uppercase">
                BIZGROW
              </h2>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] mt-1 font-black">
                Pro Console
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center justify-between group px-5 py-4 rounded-[1.8rem] text-sm font-black transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-r from-[#997819] to-[#b8952b] text-white shadow-xl shadow-[#997819]/20" 
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Icon 
                      size={20} 
                      className={cn(
                        "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                        isActive ? "text-white" : "text-white/20 group-hover:text-amber-400"
                      )} 
                    />
                    <span className="tracking-tight uppercase text-[12px]">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-white/60" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto space-y-4">
            
            {/* User Profile Info */}
            <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-[#12066a] flex items-center justify-center font-black text-lg border border-white/10 shadow-lg text-white">
                  B
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0a043c] rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
              </div>
              <div className="flex-1 overflow-hidden leading-tight text-white">
                <p className="text-sm font-black tracking-tight truncate uppercase">Bizgrow Admin</p>
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest truncate italic">Superuser</p>
              </div>
            </div>

            {/* Premium Logout Button */}
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[1.8rem] bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-95 group shadow-lg shadow-rose-500/5"
            >
              <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
              Sign Out Session
            </button>
            
          </div>

        </div>
      </aside>

      {/* Logout Modal Component */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogoutConfirm} 
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}