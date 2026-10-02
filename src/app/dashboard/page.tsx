// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import StockTable from "@/components/StockTable";
import { getAuditLogs, getDishes } from "@/lib/db";

// ==========================================
// 2. DASHBOARD SERVER PAGE COMPONENT
// ==========================================
// Pre-fetches initial dishes and audit logs server-side and renders dashboard layout
export default async function Home() {
  // Fetch initial data from database concurrently
  const { data: dishesData = [] } = await getDishes();
  const { data: auditLogsData } = await getAuditLogs(50);

  const dishes = dishesData ?? [];
  const auditLogs = auditLogsData ?? [];

  // Render dashboard layout with sidebar, header, stats, and interactive stock table
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Navigation sidebar */}
      <Sidebar />

      {/* Main dashboard content area */}
      <div className="main-content">
        <Header title="Inventory Hub" />

        <div className="dashboard-content">
          {/* Top statistics summary cards */}
          <DashboardStats initialDishes={dishes} initialAuditLogs={auditLogs} />

          {/* Real-time stock inventory table */}
          <StockTable />
        </div>
      </div>
    </div>
  );
}
