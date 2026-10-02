// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

// ==========================================
// 2. LANDING PAGE COMPONENT
// ==========================================
// Renders the public-facing marketing and feature showcase page
export default function Home() {
  return (
    <>
      {/* Top navigation bar */}
      <Navbar />

      {/* Main landing sections */}
      <main>
        <Hero />
        <Features />
      </main>

      {/* Footer footer links & branding */}
      <Footer />
    </>
  );
}
