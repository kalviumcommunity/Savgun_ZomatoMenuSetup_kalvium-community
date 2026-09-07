# 🚀 Supabase PostgreSQL Setup & Connection Guide

This guide details how to set up the PostgreSQL database in Supabase and connect it with the Fiesta (Zomato Menu Setup & Inventory Hub) Next.js application.

---

## 1. Prerequisites & Supabase Project Creation

1. Go to [Supabase](https://supabase.com/) and sign in (or create an account).
2. Click **"New Project"**.
3. Fill in:
   - **Name:** `zomato-menu-inventory` (or your preferred name)
   - **Database Password:** Enter a strong password and save it securely.
   - **Region:** Select the region closest to you (e.g. `ap-south-1` for Mumbai).
4. Click **"Create new project"** and wait 1–2 minutes for the database to provision.

---

## 2. Apply PostgreSQL Database Schema

1. In your Supabase project dashboard, navigate to the **SQL Editor** tab from the left sidebar.
2. Click **"New Query"**.
3. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository and copy its entire content.
4. Paste the SQL code into the Supabase SQL Editor and click **Run** (or press `Ctrl + Enter`).

### What this schema creates:
- **`categories`**: Menu categories (Appetizers, Main Course, Breads, Dessert, Beverages)
- **`dishes`**: Complete menu catalog with Zomato IDs, base prices, live stock, and calculated statuses
- **`pricing_rules`**: Dynamic surge pricing and discount rules with schedules
- **`audit_logs`**: Complete audit trail of price changes, surge activations, and stock lockouts
- **`inventory_logs`**: Historical change log of stock mutations
- **Automated Triggers**:
  - Auto-updates `updated_at` timestamps on row updates.
  - Automatically classifies `zomato_status` (`In Stock`, `Low Stock`, `Sold Out`) based on `live_stock` vs `min_stock_threshold`.
  - Automatically records inventory logs on stock level updates.
- **Views**: `v_active_menu` and `v_low_stock_dishes`
- **Seed Data**: Pre-populated sample data matching the UI.

---

## 3. Configure Environment Variables

1. In the Supabase dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Find:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **Project API Keys** -> `anon` `public` key
3. Open [.env.local](./.env.local) in your project root and update the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Test & Verify the Connection

Start your local Next.js development server:

```bash
npm run dev
```

Visit the health check API in your browser or with `curl`:

```
http://localhost:3000/api/health
```

Expected response when connected:

```json
{
  "status": "healthy",
  "message": "Successfully connected to Supabase PostgreSQL database!",
  "dishesCount": 8,
  "sampleData": [ ... ]
}
```

---

## 5. Using the Database in Your Application

You can use the helper utilities from `src/lib/db.js` in any component or server action:

```javascript
import { getDishes, updateDishStock, getPricingRules, getAuditLogs } from "@/lib/db";

// Fetch menu items
const { data: dishes, error } = await getDishes();

// Update stock in real-time
await updateDishStock("dish-uuid", 25, "Chef Aman");

// Fetch live audit entries
const { data: logs } = await getAuditLogs();
```

---

## 6. Real-time Subscriptions (Optional)

To enable real-time UI updates when stock or pricing changes occur:
1. In Supabase Dashboard, go to **Database** -> **Replication**.
2. Enable replication for the `dishes`, `pricing_rules`, and `audit_logs` tables.
3. In your React component, use `subscribeToDishes`:

```javascript
import { subscribeToDishes } from "@/lib/db";

useEffect(() => {
  const subscription = subscribeToDishes((payload) => {
    console.log("Database change received:", payload);
    // Refresh your state or update table
  });

  return () => subscription.unsubscribe();
}, []);
```
