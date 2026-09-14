"use client";

import React, { useEffect, useState } from "react";
import {
  createDish,
  getCategories,
  getDishes,
  updateDishStock,
  updateDishSysState,
} from "@/lib/db";

interface DishRow {
  id: string;
  name: string;
  zomatoId: string;
  category: string;
  liveStock: number;
  zomatoStatus: string;
  sysState: string;
}

interface DishDraft {
  liveStock: number;
  sysState: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface NewDishForm {
  name: string;
  zomatoId: string;
  categoryId: string;
  basePrice: string;
  liveStock: string;
  description: string;
}

const SYS_STATE_OPTIONS = ["Idle", "Reordering...", "Preparing", "Ready"];

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

const emptyNewDishForm: NewDishForm = {
  name: "",
  zomatoId: "",
  categoryId: "",
  basePrice: "0",
  liveStock: "0",
  description: "",
};

export default function StockTable() {
  const [dishes, setDishes] = useState<DishRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DishDraft>>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [newDish, setNewDish] = useState<NewDishForm>(emptyNewDishForm);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addingDish, setAddingDish] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      const { data } = await getCategories();
      setCategories((data || []).map((category: any) => ({
        id: category.id,
        name: category.name,
      })));
    } catch (err) {
      console.error("[StockTable] Failed to load categories:", err);
      setCategories([]);
    }
  }

  async function loadDishes() {
    setLoading(true);
    setError("");

    try {
      const { data } = await getDishes();
      const mappedDishes = (data || []).map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        zomatoId: dish.zomato_id,
        category: dish.categories?.name || "Uncategorized",
        liveStock: Number(dish.live_stock ?? 0),
        zomatoStatus: dish.zomato_status,
        sysState: dish.sys_state || "Idle",
      }));

      setDishes(mappedDishes);

      const nextDrafts = mappedDishes.reduce<Record<string, DishDraft>>((acc, dish) => {
        acc[dish.id] = {
          liveStock: dish.liveStock,
          sysState: dish.sysState,
        };
        return acc;
      }, {});

      setDrafts(nextDrafts);
    } catch (error) {
      console.error("[StockTable] Failed to load dishes:", error);
      setDishes([]);
      setDrafts({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadDishes();
  }, []);

  const updateDraft = (
    dishId: string,
    patch: Partial<DishDraft>
  ) => {
    setDrafts((current) => ({
      ...current,
      [dishId]: {
        ...current[dishId],
        liveStock: current[dishId]?.liveStock ?? 0,
        sysState: current[dishId]?.sysState ?? "Idle",
        ...patch,
      },
    }));
  };

  const saveDish = async (dish: DishRow, draftOverride?: DishDraft) => {
    const draft = draftOverride ?? drafts[dish.id] ?? { liveStock: dish.liveStock, sysState: dish.sysState };

    try {
      setSavingId(dish.id);
      setError("");

      const stockResult = await updateDishStock(dish.id, draft.liveStock, "Manager");
      if (stockResult.error) {
        throw stockResult.error;
      }

      const sysStateResult = await updateDishSysState(dish.id, draft.sysState);
      if (sysStateResult.error) {
        throw sysStateResult.error;
      }

      setDishes((current) =>
        current.map((item) => {
          if (item.id !== dish.id) {
            return item;
          }

          return {
            ...item,
            liveStock: Number(stockResult.data?.live_stock ?? draft.liveStock),
            zomatoStatus: stockResult.data?.zomato_status ?? item.zomatoStatus,
            sysState: sysStateResult.data?.sys_state ?? draft.sysState,
          };
        })
      );

      setDrafts((current) => ({
        ...current,
        [dish.id]: {
          liveStock: Number(stockResult.data?.live_stock ?? draft.liveStock),
          sysState: sysStateResult.data?.sys_state ?? draft.sysState,
        },
      }));
    } catch (err) {
      console.error("[StockTable] Failed to update dish:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update dish. Please try again."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateDish = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = newDish.name.trim();
    const trimmedZomatoId = newDish.zomatoId.trim();

    if (!trimmedName || !trimmedZomatoId) {
      setError("Dish name and Zomato ID are required.");
      return;
    }

    setAddingDish(true);
    setError("");

    try {
      const { error: createError } = await createDish({
        name: trimmedName,
        zomato_id: trimmedZomatoId,
        category_id: newDish.categoryId || null,
        description: newDish.description.trim(),
        base_price: Number(newDish.basePrice) || 0,
        live_stock: Math.max(0, Number(newDish.liveStock) || 0),
        min_stock_threshold: 5,
        sys_state: "Idle",
        zomato_status: "In Stock",
        dish_emoji: "🍛",
      });

      if (createError) {
        throw createError;
      }

      setNewDish(emptyNewDishForm);
      await loadDishes();
    } catch (err) {
      console.error("[StockTable] Failed to create dish:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create dish. Please try again."
      );
    } finally {
      setAddingDish(false);
    }
  };

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

      <form
        onSubmit={handleCreateDish}
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          marginBottom: 20,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#f9fafb",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Dish Name
          </label>
          <input
            type="text"
            value={newDish.name}
            onChange={(event) => setNewDish((current) => ({ ...current, name: event.target.value }))}
            className="stock-input"
            placeholder="Paneer Tikka"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Zomato ID
          </label>
          <input
            type="text"
            value={newDish.zomatoId}
            onChange={(event) => setNewDish((current) => ({ ...current, zomatoId: event.target.value }))}
            className="stock-input"
            placeholder="PT-001"
            required
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Category
          </label>
          <select
            value={newDish.categoryId}
            onChange={(event) => setNewDish((current) => ({ ...current, categoryId: event.target.value }))}
            className="stock-select"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Base Price
          </label>
          <input
            type="number"
            min={0}
            value={newDish.basePrice}
            onChange={(event) => setNewDish((current) => ({ ...current, basePrice: event.target.value }))}
            className="stock-input"
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Live Stock
          </label>
          <input
            type="number"
            min={0}
            value={newDish.liveStock}
            onChange={(event) => setNewDish((current) => ({ ...current, liveStock: event.target.value }))}
            className="stock-input"
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Description
          </label>
          <input
            type="text"
            value={newDish.description}
            onChange={(event) => setNewDish((current) => ({ ...current, description: event.target.value }))}
            className="stock-input"
            placeholder="Optional"
          />
        </div>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button type="submit" className="stock-save-btn" disabled={addingDish} style={{ width: "100%" }}>
            {addingDish ? "Adding..." : "Add Dish"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="stock-empty-state" style={{ marginBottom: 12, color: "#b91c1c" }}>
          {error}
        </div>
      ) : null}

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
              <th>Zomato ID</th>
              <th>Category</th>
              <th>Live Stock</th>
              <th>Zomato Status</th>
              <th>Sys State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => {
              const draft = drafts[dish.id] ?? {
                liveStock: dish.liveStock,
                sysState: dish.sysState,
              };

              return (
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
                  </td>
                  <td>
                    <div className="dish-id">{dish.zomatoId}</div>
                  </td>
                  <td>
                    <span className="dish-category">{dish.category}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={draft.liveStock}
                      onChange={(event) => {
                        const nextLiveStock = Math.max(0, Number(event.target.value) || 0);
                        const nextDraft = {
                          ...draft,
                          liveStock: nextLiveStock,
                        };

                        setDrafts((current) => ({
                          ...current,
                          [dish.id]: nextDraft,
                        }));
                      }}
                      onBlur={() => {
                        void saveDish(dish, drafts[dish.id] ?? draft);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveDish(dish, drafts[dish.id] ?? draft);
                        }
                      }}
                      className="stock-input"
                    />
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(dish.zomatoStatus)}`}>
                      <span className="dot" />
                      {dish.zomatoStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={draft.sysState}
                      onChange={(event) => {
                        const nextDraft = {
                          ...draft,
                          sysState: event.target.value,
                        };

                        setDrafts((current) => ({
                          ...current,
                          [dish.id]: nextDraft,
                        }));

                        void saveDish(dish, nextDraft);
                      }}
                      className="stock-select"
                    >
                      {SYS_STATE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => saveDish(dish)}
                      disabled={savingId === dish.id}
                      className="stock-save-btn"
                    >
                      {savingId === dish.id ? "Saving..." : "Update"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
