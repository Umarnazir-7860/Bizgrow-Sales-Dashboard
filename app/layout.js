"use client"; // Top par add karein kyunke hum path check kar rahe hain

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // 🔹 Check karein ke kya hum login page par hain
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body className="bg-[#0b0b0b] text-zinc-100">
        
        {/* 🔹 Sidebar sirf tab dikhegi jab login page NA HO */}
        {!isLoginPage && <Sidebar />}

        {/* 🔹 Margin sirf tab apply hogi jab sidebar maujood ho */}
        <main className={`${!isLoginPage ? "ml-[280px]" : "ml-0"} min-h-screen`}>
          {children}
        </main>

      </body>
    </html>
  );
}