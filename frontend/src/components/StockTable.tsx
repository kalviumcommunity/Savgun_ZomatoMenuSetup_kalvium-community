"use client";

import React, { useEffect, useState } from "react";
import { getDishes } from "@/lib/db";

interface DishRow {
  id: string;
  name: string;
  zomatoId: string;
  category: string;
  liveStock: number;
  zomatoStatus: string;
  sysState: string;
}

function getStatusClass(status: string) {
  switch (status) {
    case "In Stock":
      return "in-stock";
    case "Low Stock":
      return "low-stock";
    case "Sold Out":
      return "sold-out";
    default:
      return "";
  }
}

function getPreviewHue(dishId: string, dishName: string) {
  const seed = Array.from(dishId + dishName).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );

  return seed % 360;
}

export default function StockTable() {
  const [dishes, setDishes] = useState<DishRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDishes() {
      setLoading(true);

      try {
        const { data } = await getDishes();

        if (!isMounted) {
          return;
        }

        const mappedDishes = (data || []).map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          zomatoId: dish.zomato_id,
          category: dish.categories?.name || "Uncategorized",
          liveStock: dish.live_stock,
          zomatoStatus: dish.zomato_status,
          sysState: dish.sys_state,
        }));

        setDishes(mappedDishes);
      } catch (error) {
        console.error("[StockTable] Failed to load dishes:", error);
        setDishes([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDishes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="stock-section">
      <div className="stock-header">
        <h2 className="stock-title">Live Stock Monitoring</h2>
        <div className="stock-filters">
          <button className="stock-filter-btn" id="category-filter">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            All Categories
          </button>
          <button className="stock-filter-btn" id="stock-level-filter">
            Stock Level: Low to High
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="stock-empty-state">Loading live stock data...</div>
      ) : dishes.length === 0 ? (
        <div className="stock-empty-state">
          No dishes are available yet. Add dishes in the Supabase catalog.
        </div>
      ) : (
        <table className="stock-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Dish Name</th>
              <th>Category</th>
              <th>Live Stock</th>
              <th>Zomato Status</th>
              <th>Sys State</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish.id}>
                <td>
                  <div className="dish-preview">
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: `hsl(${getPreviewHue(dish.id, dish.name)}, 30%, 85%)`,
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </td>
                <td>
                  <div className="dish-name">{dish.name}</div>
                  <div className="dish-id">{dish.zomatoId}</div>
                </td>
                <td>
                  <span className="dish-category">{dish.category}</span>
                </td>
                <td>
                  <span className="dish-stock">{dish.liveStock}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(dish.zomatoStatus)}`}>
                    <span className="dot" />
                    {dish.zomatoStatus}
                  </span>
                </td>
                <td>
                  <span
                    className={`sys-state ${
                      dish.sysState === "Reordering..." ? "reordering" : ""
                    }`}
                  >
                    {dish.sysState}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
