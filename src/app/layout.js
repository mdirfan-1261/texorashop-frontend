import "./globals.css";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import AuthModal from "@/components/auth/AuthModal";

export const metadata = {
  title: "TexoraShop | Online Shopping",
  description: "Affordable and premium e-commerce shopping platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <UserProvider>
          <CartProvider>
            <StorefrontShell>{children}</StorefrontShell>
            {/* Shopsy 2-Step OTP Modal */}
            <AuthModal />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}