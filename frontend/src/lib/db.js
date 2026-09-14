import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * ==============================================================================
 * DATABASE SERVICE HELPER
 * ==============================================================================
 * Provides structured query methods for dishes, inventory stock,
 * pricing rules, categories, and audit logs with Supabase.
 */

// ------------------------------------------------------------------------------
// 1. DISHES / MENU ITEMS
// ------------------------------------------------------------------------------

export function getDishStockStatus(liveStock) {
  const normalizedStock = Math.max(0, Number(liveStock ?? 0));

  if (normalizedStock === 0) {
    return "Sold Out";
  }

  if (normalizedStock < 10) {
    return "Low Stock";
  }

  return "In Stock";
}

/**
 * Fetch all dishes along with their category and active pricing rule
 */
export async function getDishes(options = {}) {
  if (!isSupabaseConfigured()) {
    console.warn("[DB] Supabase not configured. Using fallback empty list.");
    return { data: [], error: null, isMock: true };
  }

  try {
    let query = supabase
      .from("dishes")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        pricing_rules (
          id,
          rule_name,
          rule_type,
          adjustment_percentage,
          time_start,
          time_end,
          is_active
        )
      `)
      .order("created_at", { ascending: true });

    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    if (options.status) {
      query = query.eq("zomato_status", options.status);
    }

    const { data, error } = await query;
    return { data, error, isMock: false };
  } catch (err) {
    console.error("[DB] Error fetching dishes:", err);
    return { data: null, error: err, isMock: false };
  }
}

/**
 * Fetch a single dish by ID
 */
export async function getDishById(id) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("dishes")
    .select(`
      *,
      categories (*),
      pricing_rules (*)
    `)
    .eq("id", id)
    .single();

  return { data, error };
}

export async function createDish(dishData = {}) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  try {
    const payload = {
      ...dishData,
      name: String(dishData.name || "").trim(),
      zomato_id: String(dishData.zomato_id || "").trim(),
      category_id: dishData.category_id || null,
      description: dishData.description || "",
      base_price: Number(dishData.base_price ?? 0),
      live_stock: Math.max(0, Number(dishData.live_stock ?? 0)),
      min_stock_threshold: Math.max(0, Number(dishData.min_stock_threshold ?? 5)),
      sys_state: dishData.sys_state || "Idle",
      zomato_status: getDishStockStatus(dishData.live_stock ?? 0),
      is_available: dishData.is_available ?? true,
      dish_emoji: dishData.dish_emoji || "🍛",
    };

    if (!payload.name || !payload.zomato_id) {
      return {
        data: null,
        error: new Error("Dish name and Zomato ID are required."),
      };
    }

    const { data, error } = await supabase
      .from("dishes")
      .insert([payload])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update a dish's live stock count
 */
export async function updateDishStock(dishId, newStock, actorName = "Chef / Manager") {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  try {
    const normalizedStock = Math.max(0, parseInt(newStock, 10));
    const stockStatus = getDishStockStatus(normalizedStock);

    const { data, error } = await supabase
      .from("dishes")
      .update({
        live_stock: normalizedStock,
        zomato_status: stockStatus,
      })
      .eq("id", dishId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function updateDishSysState(dishId, sysState) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  try {
    const { data, error } = await supabase
      .from("dishes")
      .update({ sys_state: sysState })
      .eq("id", dishId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update dish price and automatically record audit entry
 */
export async function updateDishPrice(dishId, dishName, oldPrice, newPrice, actor = "Manager", actorRole = "Manager") {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("dishes")
    .update({ base_price: parseFloat(newPrice) })
    .eq("id", dishId)
    .select()
    .single();

  if (!error) {
    await recordAuditLog({
      dish_id: dishId,
      dish_name: dishName,
      action_type: "PRICE_UPDATE",
      description: `Price updated ₹${oldPrice} → ₹${newPrice}`,
      actor,
      actor_role: actorRole,
      actor_color: "#E23744",
      avatar_bg: "#FEE2E2",
    });
  }

  return { data, error };
}

// ------------------------------------------------------------------------------
// 2. CATEGORIES
// ------------------------------------------------------------------------------

export async function getCategories() {
  if (!isSupabaseConfigured()) return { data: [], error: null, isMock: true };

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return { data, error, isMock: false };
}

// ------------------------------------------------------------------------------
// 3. PRICING RULES
// ------------------------------------------------------------------------------

export async function getPricingRules() {
  if (!isSupabaseConfigured()) return { data: [], error: null, isMock: true };

  const { data, error } = await supabase
    .from("pricing_rules")
    .select(`
      *,
      dishes (
        id,
        name,
        dish_emoji,
        base_price
      )
    `)
    .order("created_at", { ascending: false });

  return { data, error, isMock: false };
}

export async function createPricingRule(ruleData) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("pricing_rules")
    .insert([ruleData])
    .select()
    .single();

  return { data, error };
}

export async function togglePricingRule(ruleId, isActive) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("pricing_rules")
    .update({ is_active: isActive })
    .eq("id", ruleId)
    .select()
    .single();

  return { data, error };
}

// ------------------------------------------------------------------------------
// 4. AUDIT LOGS
// ------------------------------------------------------------------------------

export async function getAuditLogs(limit = 20) {
  if (!isSupabaseConfigured()) return { data: [], error: null, isMock: true };

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data, error, isMock: false };
}

export async function recordAuditLog(logEntry) {
  if (!isSupabaseConfigured()) return { data: null, error: null };

  const { data, error } = await supabase
    .from("audit_logs")
    .insert([
      {
        dish_id: logEntry.dish_id || null,
        dish_name: logEntry.dish_name,
        action_type: logEntry.action_type || "SYSTEM_EVENT",
        description: logEntry.description,
        actor: logEntry.actor || "System Sync",
        actor_role: logEntry.actor_role || "",
        actor_color: logEntry.actor_color || "#1BA672",
        avatar_bg: logEntry.avatar_bg || "#D1FAE5",
        metadata: logEntry.metadata || {},
      },
    ])
    .select()
    .single();

  return { data, error };
}

// ------------------------------------------------------------------------------
// 5. REAL-TIME SUBSCRIPTION HELPERS
// ------------------------------------------------------------------------------

/**
 * Subscribe to live stock or pricing changes
 */
export function subscribeToDishes(onUpdate) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

  const channel = supabase
    .channel("dishes-live-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dishes" },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
