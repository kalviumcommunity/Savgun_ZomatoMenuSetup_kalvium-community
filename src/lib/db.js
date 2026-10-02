// ==========================================
// 1. IMPORTS & INITIALIZATION
// ==========================================
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/**
 * ==============================================================================
 * DATABASE SERVICE HELPER
 * ==============================================================================
 * Provides structured query methods for dishes, inventory stock,
 * pricing rules, categories, and audit logs with Supabase.
 */

// ==========================================
// 2. DISHES / MENU ITEMS OPERATIONS
// ==========================================

const FALLBACK_CATEGORIES = [
  { id: "cat-1", name: "Appetizers & Starters", slug: "appetizers", sort_order: 1 },
  { id: "cat-2", name: "Main Course", slug: "main-course", sort_order: 2 },
  { id: "cat-3", name: "Breads & Rice", slug: "breads-rice", sort_order: 3 },
  { id: "cat-4", name: "Desserts", slug: "desserts", sort_order: 4 },
  { id: "cat-5", name: "Beverages", slug: "beverages", sort_order: 5 },
  { id: "cat-6", name: "Chef's Specials", slug: "chef-specials", sort_order: 6 },
];

const FALLBACK_DISHES = [
  {
    id: "dish-1",
    name: "Tandoori Chicken Platter",
    zomato_id: "ZF-TCP-001",
    dish_emoji: "🍗",
    base_price: 420,
    live_stock: 0,
    min_stock_threshold: 5,
    zomato_status: "Sold Out",
    sys_state: "Idle",
    categories: { id: "cat-1", name: "Appetizers & Starters" },
    pricing_rules: {
      id: "pr-1",
      rule_name: "Dinner Rush Surge",
      rule_type: "surge",
      adjustment_percentage: 15,
      time_start: "19:00:00",
      time_end: "22:00:00",
      is_active: true,
    },
  },
  {
    id: "dish-2",
    name: "Gulab Jamun with Rabdi",
    zomato_id: "ZF-GJR-002",
    dish_emoji: "🍨",
    base_price: 150,
    live_stock: 3,
    min_stock_threshold: 10,
    zomato_status: "Low Stock",
    sys_state: "Reordering...",
    categories: { id: "cat-4", name: "Desserts" },
    pricing_rules: {
      id: "pr-2",
      rule_name: "Sweet Tooth Happy Hour",
      rule_type: "discount",
      adjustment_percentage: 10,
      time_start: "14:00:00",
      time_end: "17:00:00",
      is_active: true,
    },
  },
  {
    id: "dish-3",
    name: "Hyderabadi Dum Biryani",
    zomato_id: "ZF-HDB-003",
    dish_emoji: "🍛",
    base_price: 310,
    live_stock: 4,
    min_stock_threshold: 10,
    zomato_status: "Low Stock",
    sys_state: "Reordering...",
    categories: { id: "cat-6", name: "Chef's Specials" },
    pricing_rules: null,
  },
  {
    id: "dish-4",
    name: "Crispy Chilli Paneer",
    zomato_id: "ZF-CCP-004",
    dish_emoji: "🍲",
    base_price: 280,
    live_stock: 14,
    min_stock_threshold: 8,
    zomato_status: "In Stock",
    sys_state: "Ready",
    categories: { id: "cat-1", name: "Appetizers & Starters" },
    pricing_rules: null,
  },
  {
    id: "dish-5",
    name: "Butter Chicken Delicacy",
    zomato_id: "ZF-BCD-005",
    dish_emoji: "🥘",
    base_price: 390,
    live_stock: 18,
    min_stock_threshold: 10,
    zomato_status: "In Stock",
    sys_state: "Preparing",
    categories: { id: "cat-2", name: "Main Course" },
    pricing_rules: null,
  },
  {
    id: "dish-6",
    name: "Alphonso Mango Lassi",
    zomato_id: "ZF-AML-006",
    dish_emoji: "🍹",
    base_price: 120,
    live_stock: 22,
    min_stock_threshold: 10,
    zomato_status: "In Stock",
    sys_state: "Ready",
    categories: { id: "cat-5", name: "Beverages" },
    pricing_rules: null,
  },
  {
    id: "dish-7",
    name: "Paneer Tikka Butter Masala",
    zomato_id: "ZF-PTM-007",
    dish_emoji: "🍛",
    base_price: 340,
    live_stock: 24,
    min_stock_threshold: 8,
    zomato_status: "In Stock",
    sys_state: "Ready",
    categories: { id: "cat-2", name: "Main Course" },
    pricing_rules: null,
  },
  {
    id: "dish-8",
    name: "Dal Makhani Royal",
    zomato_id: "ZF-DMR-008",
    dish_emoji: "🥣",
    base_price: 260,
    live_stock: 35,
    min_stock_threshold: 12,
    zomato_status: "In Stock",
    sys_state: "Ready",
    categories: { id: "cat-2", name: "Main Course" },
    pricing_rules: null,
  },
  {
    id: "dish-9",
    name: "Garlic Butter Naan",
    zomato_id: "ZF-GBN-009",
    dish_emoji: "🫓",
    base_price: 65,
    live_stock: 50,
    min_stock_threshold: 15,
    zomato_status: "In Stock",
    sys_state: "Ready",
    categories: { id: "cat-3", name: "Breads & Rice" },
    pricing_rules: null,
  },
];

const FALLBACK_AUDIT_LOGS = [
  {
    id: "log-1",
    dish_id: "dish-1",
    dish_name: "Tandoori Chicken Platter",
    description: "Marked Sold Out automatically on 0 inventory",
    actor: "Inventory System",
    actor_role: "Auto Sync",
    actor_color: "#E23744",
    avatar_bg: "#FEE2E2",
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: "log-2",
    dish_id: "dish-2",
    dish_name: "Gulab Jamun with Rabdi",
    description: "Reordering flag triggered (stock reached 3)",
    actor: "Chef Rajesh",
    actor_role: "Kitchen Head",
    actor_color: "#F5A623",
    avatar_bg: "#FEF3C7",
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
  },
  {
    id: "log-3",
    dish_id: "dish-1",
    dish_name: "Tandoori Chicken Platter",
    description: "Surge rule applied: +15% for peak dinner",
    actor: "Priya Sharma",
    actor_role: "Restaurant GM",
    actor_color: "#E23744",
    avatar_bg: "#FEE2E2",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "log-4",
    dish_id: "dish-5",
    dish_name: "Butter Chicken Delicacy",
    description: "Stock refreshed to 18 units from batch #4",
    actor: "Aman Gupta",
    actor_role: "Store Manager",
    actor_color: "#1BA672",
    avatar_bg: "#D1FAE5",
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

/**
 * Fetch all dishes with associated category and pricing rule details.
 * Supports optional filtering by categoryId and status.
 */
export async function getDishes(options = {}) {
  // Gracefully fallback if Supabase credentials are missing
  if (!isSupabaseConfigured()) {
    console.warn("[DB] Supabase not configured. Using fallback catalog.");
    return { data: FALLBACK_DISHES, error: null, isMock: true };
  }

  try {
    // Build query joining categories and pricing rules
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

    // Apply optional category filter
    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    // Apply optional status filter (e.g., In Stock, Low Stock, Sold Out)
    if (options.status) {
      query = query.eq("zomato_status", options.status);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return { data: FALLBACK_DISHES, error: null, isMock: true };
    }
    return { data, error, isMock: false };
  } catch (err) {
    console.error("[DB] Error fetching dishes, using fallback:", err);
    return { data: FALLBACK_DISHES, error: null, isMock: true };
  }
}

/**
 * Fetch a single dish record by its UUID, including relations.
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

/**
 * Create and insert a new dish into the menu.
 */
export async function createDish(dishData) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("dishes")
    .insert([dishData])
    .select()
    .single();

  return { data, error };
}

/**
 * Update the inventory stock level for a dish (ensuring non-negative count).
 */
export async function updateDishStock(dishId, newStock, actorName = "Chef / Manager") {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  try {
    const { data, error } = await supabase
      .from("dishes")
      .update({ live_stock: Math.max(0, parseInt(newStock, 10)) })
      .eq("id", dishId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update the kitchen preparation state (Idle, Preparing, Ready, Reordering...).
 */
export async function updateDishSysState(dishId, newSysState) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  try {
    const { data, error } = await supabase
      .from("dishes")
      .update({ sys_state: newSysState })
      .eq("id", dishId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update the base price of a dish and automatically append an audit log entry.
 */
export async function updateDishPrice(dishId, dishName, oldPrice, newPrice, actor = "Manager", actorRole = "Manager") {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("dishes")
    .update({ base_price: parseFloat(newPrice) })
    .eq("id", dishId)
    .select()
    .single();

  // Log price change to audit trail if DB update succeeded
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

// ==========================================
// 3. CATEGORIES OPERATIONS
// ==========================================

/**
 * Retrieve all dish categories ordered by custom display sequence.
 */
export async function getCategories() {
  if (!isSupabaseConfigured()) return { data: FALLBACK_CATEGORIES, error: null, isMock: true };

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return { data: FALLBACK_CATEGORIES, error: null, isMock: true };
    }

    return { data, error, isMock: false };
  } catch (err) {
    return { data: FALLBACK_CATEGORIES, error: null, isMock: true };
  }
}

// ==========================================
// 4. PRICING RULES OPERATIONS
// ==========================================

/**
 * Fetch all dynamic pricing rules and their linked target dish details.
 */
export async function getPricingRules() {
  if (!isSupabaseConfigured()) return { data: [], error: null, isMock: true };

  try {
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

    return { data: data || [], error, isMock: false };
  } catch (err) {
    return { data: [], error: null, isMock: true };
  }
}

/**
 * Create and insert a new dynamic pricing rule.
 */
export async function createPricingRule(ruleData) {
  if (!isSupabaseConfigured()) return { data: null, error: "Not configured" };

  const { data, error } = await supabase
    .from("pricing_rules")
    .insert([ruleData])
    .select()
    .single();

  return { data, error };
}

/**
 * Toggle the activation status of a pricing rule on or off.
 */
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

// ==========================================
// 5. AUDIT LOGS OPERATIONS
// ==========================================

/**
 * Retrieve recent audit trail entries up to a specified limit.
 */
export async function getAuditLogs(limit = 20) {
  if (!isSupabaseConfigured()) return { data: FALLBACK_AUDIT_LOGS, error: null, isMock: true };

  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return { data: FALLBACK_AUDIT_LOGS, error: null, isMock: true };
    }

    return { data, error, isMock: false };
  } catch (err) {
    return { data: FALLBACK_AUDIT_LOGS, error: null, isMock: true };
  }
}

/**
 * Record a new action or event into the system audit trail table.
 */
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

// ==========================================
// 6. REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to real-time Postgres changes on the dishes table via Supabase channels.
 */
export function subscribeToDishes(onUpdate) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

  // Create unique channel identifier for subscription
  const channelName = "dishes-live-changes-" + Math.random().toString(36).substring(7);
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dishes" },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  // Return unsubscribe handler to clean up listener
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
