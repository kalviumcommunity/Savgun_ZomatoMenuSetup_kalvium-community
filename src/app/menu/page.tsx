import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PricingRules from "@/components/PricingRules";
import AuditTrail from "@/components/AuditTrail";

export const metadata = {
  title: "Menu & Pricing Suite - Fieasto | Zomato Restaurant Management",
  description:
    "Manage menu pricing rules, surge pricing, and track live audit trail for your Zomato-synced restaurant.",
};

export default function MenuPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <Header title="Menu & Pricing Suite" />

        {/* Page Content */}
        <div className="dashboard-content">
          <div className="menu-layout">
            {/* Left: Pricing Rules */}
            <div className="menu-main">
              <PricingRules />
            </div>

            {/* Right: Audit Trail */}
            <div className="menu-aside">
              <AuditTrail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
