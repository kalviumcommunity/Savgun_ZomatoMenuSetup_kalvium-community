import express from "express";
import cors from "cors";
import { 
  getDishes, 
  updateDishStock,
  getDishById,
  updateDishPrice,
  getCategories,
  getPricingRules,
  createPricingRule,
  togglePricingRule,
  getAuditLogs,
  recordAuditLog
} from "./lib/db.js";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------------------
// HEALTH ROUTE (Migrated from src/app/api/health/route.js)
// ------------------------------------------------------------------------------
app.get("/api/health", async (req, res) => {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return res.status(200).json({
      status: "unconfigured",
      message:
        "Supabase environment variables are not yet configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
      supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
  }

  try {
    const { data, error, count } = await supabase
      .from("dishes")
      .select("id, name, live_stock, zomato_status", { count: "exact" })
      .limit(5);

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Connected to Supabase, but encountered an error querying the dishes table.",
        error: error.message,
        hint: "Make sure you have run supabase/schema.sql in your Supabase SQL Editor.",
      });
    }

    return res.status(200).json({
      status: "healthy",
      message: "Successfully connected to Supabase PostgreSQL database!",
      dishesCount: count,
      sampleData: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: "connection_failed",
      message: "Failed to connect to Supabase endpoint.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------------------------------
// DISHES ROUTE (Migrated from src/app/api/dishes/route.js)
// ------------------------------------------------------------------------------
app.get("/api/dishes", async (req, res) => {
  const categoryId = req.query.categoryId || undefined;
  const status = req.query.status || undefined;

  const result = await getDishes({ categoryId, status });

  if (result.error) {
    return res.status(500).json({ error: result.error.message || result.error });
  }

  return res.status(200).json({
    data: result.data,
    isMock: result.isMock,
  });
});

app.patch("/api/dishes", async (req, res) => {
  try {
    const { dishId, liveStock, actor } = req.body;

    if (!dishId || liveStock === undefined) {
      return res.status(400).json({ error: "Missing required fields: dishId, liveStock" });
    }

    const result = await updateDishStock(dishId, liveStock, actor);

    if (result.error) {
      return res.status(500).json({ error: result.error.message || result.error });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
});

app.get("/api/dishes/:id", async (req, res) => {
  const result = await getDishById(req.params.id);
  if (result.error) {
    return res.status(500).json({ error: result.error.message || result.error });
  }
  return res.status(200).json({ data: result.data });
});

app.patch("/api/dishes/:id/price", async (req, res) => {
  try {
    const { dishName, oldPrice, newPrice, actor, actorRole } = req.body;
    if (newPrice === undefined) {
      return res.status(400).json({ error: "Missing required field: newPrice" });
    }
    const result = await updateDishPrice(req.params.id, dishName, oldPrice, newPrice, actor, actorRole);
    if (result.error) {
      return res.status(500).json({ error: result.error.message || result.error });
    }
    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
});

// ------------------------------------------------------------------------------
// CATEGORIES ROUTES
// ------------------------------------------------------------------------------
app.get("/api/categories", async (req, res) => {
  const result = await getCategories();
  if (result.error) {
    return res.status(500).json({ error: result.error.message || result.error });
  }
  return res.status(200).json({ data: result.data, isMock: result.isMock });
});

// ------------------------------------------------------------------------------
// PRICING RULES ROUTES
// ------------------------------------------------------------------------------
app.get("/api/pricing-rules", async (req, res) => {
  const result = await getPricingRules();
  if (result.error) {
    return res.status(500).json({ error: result.error.message || result.error });
  }
  return res.status(200).json({ data: result.data, isMock: result.isMock });
});

app.post("/api/pricing-rules", async (req, res) => {
  try {
    const result = await createPricingRule(req.body);
    if (result.error) {
      return res.status(500).json({ error: result.error.message || result.error });
    }
    return res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
});

app.patch("/api/pricing-rules/:id/toggle", async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ error: "Missing required field: isActive" });
    }
    const result = await togglePricingRule(req.params.id, isActive);
    if (result.error) {
      return res.status(500).json({ error: result.error.message || result.error });
    }
    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
});

// ------------------------------------------------------------------------------
// AUDIT LOGS ROUTES
// ------------------------------------------------------------------------------
app.get("/api/audit-logs", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const result = await getAuditLogs(limit);
  if (result.error) {
    return res.status(500).json({ error: result.error.message || result.error });
  }
  return res.status(200).json({ data: result.data, isMock: result.isMock });
});

app.post("/api/audit-logs", async (req, res) => {
  try {
    const result = await recordAuditLog(req.body);
    if (result.error) {
      return res.status(500).json({ error: result.error.message || result.error });
    }
    return res.status(201).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request body", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Express server is running on port ${PORT}`);
});
