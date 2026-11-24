"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CategoryStrip from "@/components/home/CategoryStrip";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav"; // 👈 Naya MobileNav

export default function StorefrontShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isInvoice = pathname?.startsWith("/invoice");

  if (isAdmin) {
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  // Pure clean layout for Invoice (NO Navbar, NO CategoryStrip, NO Footer, NO MobileNav)
  if (isInvoice) {
    return <main className="min-h-screen bg-slate-100 print:bg-white">{children}</main>;
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-white print:hidden">
        <Navbar />
        <CategoryStrip />
      </div>
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <div className="print:hidden">
        <Footer />
        <MobileNav />
      </div>
    </>
  );
}