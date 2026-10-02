// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PricingRules from "@/components/PricingRules";
import AuditTrail from "@/components/AuditTrail";

// ==========================================
// 2. PAGE METADATA
// ==========================================
export const metadata = {
  title: "Menu & Pricing Suite - Fieasto | Zomato Restaurant Management",
  description:
    "Manage menu pricing rules, surge pricing, and track live audit trail for your Zomato-synced restaurant.",
};

// ==========================================
// 3. MENU & PRICING PAGE COMPONENT
// ==========================================
// Renders the pricing suite view with pricing rules and live audit history
export default function MenuPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Navigation sidebar */}
      <Sidebar />

      {/* Main content viewport */}
      <div className="main-content">
        {/* Top header navigation */}
        <Header title="Menu & Pricing Suite" />

        {/* Page body content */}
        <div className="dashboard-content">
          <div className="menu-layout">
            {/* Left section: Dynamic pricing rules builder */}
            <div className="menu-main">
              <PricingRules />
            </div>

            {/* Right section: System activity audit trail */}
            <div className="menu-aside">
              <AuditTrail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
