import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fieasto - Inventory Hub | Zomato Restaurant Management",
  description: "Real-time inventory management dashboard for restaurants synced with Zomato. Track stock levels, manage dishes, and monitor orders seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
