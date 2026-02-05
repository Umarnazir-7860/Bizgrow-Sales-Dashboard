import Sidebar from "@/components/Sidebar";
import "./globals.css";


export const metadata = {
  title: "BizGrow | Sales Intelligence Dashboard",
  description: "Next-gen sales tracking and analytics console for BizGrow",
  icons: {
    icon: "/site-icon.png", // Dash (-) use karein, dot (.) nahi
    apple: "/site-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0b0b] text-zinc-100">
        
        {/* Sidebar */}
       
          <Sidebar />
        

        {/* Main Content */}
        <main className="ml-[280px] min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}
