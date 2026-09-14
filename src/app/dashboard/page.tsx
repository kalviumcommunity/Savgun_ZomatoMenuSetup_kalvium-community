import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import StockTable from "@/components/StockTable";
import { getAuditLogs, getDishes } from "@/lib/db";

export default async function Home() {
  const { data: dishesData = [] } = await getDishes();
  const { data: auditLogsData } = await getAuditLogs(50);

  const dishes = dishesData ?? [];
  const auditLogs = auditLogsData ?? [];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div className="main-content">
        <Header title="Inventory Hub" />

        <div className="dashboard-content">
          <DashboardStats initialDishes={dishes} initialAuditLogs={auditLogs} />
          <StockTable />
        </div>
      </div>
    </div>
  );
}
