// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ==========================================
// 2. FONT CONFIGURATION
// ==========================================
// Configure Inter font with variable CSS class and supported weights
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// ==========================================
// 3. APPLICATION METADATA
// ==========================================
export const metadata: Metadata = {
  title: "Fieasto - Inventory Hub | Zomato Restaurant Management",
  description:
    "Real-time inventory management dashboard for restaurants synced with Zomato. Track stock levels, manage dishes, and monitor orders seamlessly.",
};

// ==========================================
// 4. ROOT LAYOUT COMPONENT
// ==========================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
