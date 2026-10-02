"use client";

// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { getDishes, getAuditLogs, subscribeToDishes } from "@/lib/db";

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
interface DashboardStatsProps {
  initialDishes: any[];
  initialAuditLogs: any[];
}

// ==========================================
// 3. MAIN COMPONENT: DASHBOARD STATS
// ==========================================
export default function DashboardStats({ initialDishes, initialAuditLogs }: DashboardStatsProps) {
  // --- Component State ---
  const [dishes, setDishes] = useState(initialDishes || []);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs || []);

  // --- Real-time & Event Subscriptions ---
  useEffect(() => {
    // Refresh local state with latest database records
    const handleUpdate = () => {
      getDishes().then(({ data }) => setDishes(data ?? []));
      getAuditLogs(50).then(({ data }) => setAuditLogs(data ?? []));
    };

    // Listen for local custom window event emitted on manual table changes
    window.addEventListener("dishesUpdated", handleUpdate);

    // Listen for real-time Postgres changes from Supabase channel
    const sub = subscribeToDishes(handleUpdate);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("dishesUpdated", handleUpdate);
      sub.unsubscribe();
    };
  }, []);

  // --- Derived Metrics & Aggregations ---
  // Count dishes with stock above low-stock threshold (> 10)
  const activeDishes = dishes.filter(
    (dish) => Number(dish.live_stock ?? 0) > 10
  ).length;

  // Count dishes requiring replenishment (stock <= 10)
  const lowStockAlerts = dishes.filter(
    (dish) => Number(dish.live_stock ?? 0) <= 10
  ).length;

  // Dishes with kitchen system state marked as "Ready"
  const readyDishes = dishes.filter((dish) => dish.sys_state === "Ready");
  const ordersPlacedToday = readyDishes.length;

  // Sum gross value of ready dishes
  const revenueToday = readyDishes.reduce(
    (sum, dish) => sum + Number(dish.base_price || 0),
    0
  );

  // Identify highest priced dish in current inventory
  const topSeller = dishes.reduce((best, dish) => {
    if (!best) return dish;
    return Number(dish.base_price || 0) > Number(best.base_price || 0)
      ? dish
      : best;
  }, dishes[0] ?? null);

  // --- Render ---
  return (
    <div className="stats-grid">
      {/* Active Dishes Metric Card */}
      <StatCard
        title="Active Dishes"
        value={activeDishes.toString()}
        subtitle="Synced live on Zomato"
        linkText={activeDishes > 0 ? "Database sync enabled" : "No dishes found"}
        linkColor="green"
        iconColor="red"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
          </svg>
        }
      />

      {/* Low Stock Alerts Metric Card */}
      <StatCard
        title="Low Stock Alerts"
        value={lowStockAlerts.toString()}
        subtitle="Require kitchen attention"
        linkText={
          lowStockAlerts > 0
            ? `${lowStockAlerts} items need attention`
            : "All dishes within threshold"
        }
        linkColor="red"
        iconColor="amber"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        }
      />

      {/* Orders Placed Today Metric Card */}
      <StatCard
        title="Orders Placed Today"
        value={ordersPlacedToday.toString()}
        subtitle="Recent audit events synced"
        linkText={
          ordersPlacedToday > 0
            ? `Across ${auditLogs.length} live updates`
            : "No recent order activity"
        }
        linkColor="green"
        iconColor="green"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        }
      />

      {/* Revenue Today Metric Card */}
      <StatCard
        title="Revenue Today"
        value={`₹${revenueToday.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`}
        subtitle="Live estimated gross"
        linkText={
          topSeller
            ? `Top seller: ${topSeller.name}`
            : "No menu data available"
        }
        linkColor="green"
        iconColor="orange"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
          </svg>
        }
      />
    </div>
  );
}
