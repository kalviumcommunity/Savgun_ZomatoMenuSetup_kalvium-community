"use client";

import React from "react";

interface DishRow {
  id: string;
  name: string;
  zomatoId: string;
  category: string;
  liveStock: number;
  zomatoStatus: "In Stock" | "Low Stock" | "Sold Out";
  sysState: string;
}

const dishes: DishRow[] = [
  {
    id: "1",
    name: "Tandoori Chicken (Full)",
    zomatoId: "Zomato ID: KDM-1042",
    category: "Appetizers",
    liveStock: 28,
    zomatoStatus: "In Stock",
    sysState: "Idle",
  },
  {
    id: "2",
    name: "Paneer Butter Masala",
    zomatoId: "Zomato ID: KDM-1043",
    category: "Main Course",
    liveStock: 3,
    zomatoStatus: "Low Stock",
    sysState: "Reordering...",
  },
  {
    id: "3",
    name: "Butter Naan",
    zomatoId: "Zomato ID: KDM-1044",
    category: "Breads",
    liveStock: 140,
    zomatoStatus: "In Stock",
    sysState: "Idle",
  },
  {
    id: "4",
    name: "Mutton Rogan Josh",
    zomatoId: "Zomato ID: KDM-1046",
    category: "Main Course",
    liveStock: 0,
    zomatoStatus: "Sold Out",
    sysState: "Idle",
  },
  {
    id: "5",
    name: "Gulab Jamun (Double)",
    zomatoId: "Zomato ID: KDM-1048",
    category: "Dessert",
    liveStock: 12,
    zomatoStatus: "Low Stock",
    sysState: "Idle",
  },
];

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

export default function StockTable() {
  return (
    <div className="stock-section">
      {/* Header */}
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

      {/* Table */}
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
                      background: `hsl(${parseInt(dish.id) * 60}, 30%, 85%)`,
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
    </div>
  );
}
