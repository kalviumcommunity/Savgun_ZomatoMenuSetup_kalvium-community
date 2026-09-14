import { faker } from "@faker-js/faker";
import { getSupabaseAdmin, isSupabaseConfigured, supabase } from "./lib/supabaseClient.js";

const DEFAULTS = {
  categories: 5,
  dishes: 20,
  users: 5,
  auditLogs: 12,
  pricingRules: 4,
  password: "Test@1234",
};

const argv = Object.fromEntries(
  process.argv
    .slice(2)
    .map((entry) => {
      const normalized = entry.startsWith("--") ? entry.slice(2) : entry;
      const [key, value] = normalized.split("=");
      return [key, value ?? true];
    })
);

const options = {
  categories: Number(argv.categories ?? DEFAULTS.categories),
  dishes: Number(argv.dishes ?? DEFAULTS.dishes),
  users: Number(argv.users ?? DEFAULTS.users),
  auditLogs: Number(argv.auditLogs ?? DEFAULTS.auditLogs),
  pricingRules: Number(argv.pricingRules ?? DEFAULTS.pricingRules),
  password: argv.password ?? DEFAULTS.password,
  dryRun: argv["dry-run"] === true || argv["dryRun"] === true,
};

const categoryNames = [
  "Appetizers",
  "Main Course",
  "Breads",
  "Dessert",
  "Beverages",
  "Chef Specials",
  "Snacks",
  "Combo Meals",
];

const emojis = ["🍛", "🍕", "🥗", "🍔", "🍰", "🍜", "🍢", "🥘", "🍗", "🍹"];
const roles = ["Manager", "Chef", "Inventory", "Admin"];
const actions = [
  "PRICE_UPDATE",
  "STOCK_DEPLETED",
  "SURGE_ACTIVATED",
  "STATUS_CHANGE",
  "MANUAL_OVERRIDE",
];

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createCategories() {
  return Array.from({ length: Math.max(1, options.categories) }, (_, index) => {
    const name = categoryNames[index] ?? faker.commerce.productMaterial();
    return {
      name,
      slug: toSlug(name) + (index > 4 ? `-${index + 1}` : ""),
      description: faker.lorem.sentence(),
      sort_order: index + 1,
    };
  });
}

function createUsers() {
  return Array.from({ length: Math.max(1, options.users) }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      full_name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number("+91##########"),
      role: roles[index % roles.length],
      password: options.password,
    };
  });
}

function createDishes(categories) {
  return Array.from({ length: Math.max(1, options.dishes) }, (_, index) => {
    const category = categories[index % categories.length];
    const basePrice = Number(faker.commerce.price({ min: 80, max: 450, dec: 2 }));
    const liveStock = faker.number.int({ min: 0, max: 60 });

    return {
      name: faker.food.dish(),
      zomato_id: `faker-${Date.now()}-${index + 1}`,
      category_id: category.id,
      description: faker.lorem.sentence(),
      image_url: faker.image.urlLoremFlickr({ category: "food" }),
      dish_emoji: emojis[index % emojis.length],
      base_price: basePrice,
      live_stock: liveStock,
      min_stock_threshold: faker.number.int({ min: 3, max: 10 }),
      is_available: true,
      sys_state: faker.helpers.arrayElement(["Idle", "Reordering...", "Preparing", "Ready"]),
    };
  });
}

function createPricingRules(dishes) {
  return Array.from({ length: Math.min(Math.max(1, options.pricingRules), dishes.length) }, (_, index) => {
    const dish = dishes[index % dishes.length];
    const isDiscount = index % 2 === 0;
    const adjustment = isDiscount
      ? Number(faker.number.float({ min: 5, max: 25, multipleOf: 0.5 }))
      : Number(faker.number.float({ min: 8, max: 18, multipleOf: 0.5 }));

    return {
      dish_id: dish.id,
      rule_name: `${isDiscount ? "Lunch" : "Dinner"} ${faker.food.dish()}`,
      rule_type: isDiscount ? "discount" : "surge",
      adjustment_percentage: isDiscount ? -adjustment : adjustment,
      time_start: isDiscount ? "12:00:00" : "18:00:00",
      time_end: isDiscount ? "15:00:00" : "21:00:00",
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      is_active: true,
    };
  });
}

function createAuditLogs(dishes) {
  return Array.from({ length: Math.max(1, options.auditLogs) }, (_, index) => {
    const dish = dishes[index % dishes.length];
    const actionType = actions[index % actions.length];
    const actorRole = roles[index % roles.length];

    return {
      dish_id: dish.id,
      dish_name: dish.name,
      action_type: actionType,
      description: faker.lorem.sentence(),
      actor: faker.person.fullName(),
      actor_role: actorRole,
      actor_color: faker.color.rgb({ format: "hex" }),
      avatar_bg: faker.color.rgb({ format: "hex" }),
      metadata: {
        source: "faker-seed",
        iteration: index + 1,
      },
    };
  });
}

async function insertCategories(categoryRows) {
  const { data, error } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select();

  if (error) {
    throw error;
  }

  return data;
}

async function insertDishes(dishRows) {
  const { data, error } = await supabase
    .from("dishes")
    .upsert(dishRows, { onConflict: "zomato_id" })
    .select();

  if (error) {
    throw error;
  }

  return data;
}

async function insertPricingRules(ruleRows) {
  const { data, error } = await supabase
    .from("pricing_rules")
    .insert(ruleRows)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

async function insertAuditLogs(logRows) {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert(logRows)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

async function createAuthUsers(userRows) {
  try {
    const admin = getSupabaseAdmin();

    const createdUsers = [];

    for (const user of userRows) {
      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
        },
      });

      if (error) {
        console.warn(`Failed to create auth user ${user.email}: ${error.message}`);
        continue;
      }

      createdUsers.push({
        id: data.user?.id,
        email: data.user?.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        password: user.password,
      });
    }

    return createdUsers;
  } catch (error) {
    console.warn(`Supabase admin auth is not available: ${error.message}`);
    return [];
  }
}

async function main() {
  if (argv.help || argv.h) {
    console.log(`Usage: node seed-demo.js [--categories=5] [--dishes=20] [--users=5] [--auditLogs=12] [--pricingRules=4] [--password=Test@1234] [--dry-run]`);
    return;
  }

  if (!isSupabaseConfigured()) {
    console.warn("Supabase environment is not configured. Seed data cannot be inserted yet.");
    console.log("Previewing generated demo data instead:\n");

    const categories = createCategories();
    const users = createUsers();
    const dishPreview = createDishes(categories.map((category) => ({ ...category, id: faker.string.uuid() }))).map((dish) => ({
      ...dish,
      category_name: categories[dish.category_id % categories.length]?.name ?? "Unknown",
    }));

    console.log("Categories:", categories);
    console.log("Users:", users);
    console.log("Dishes:", dishPreview.slice(0, 5));
    console.log("\nSet NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then rerun the script to insert the data.");
    return;
  }

  const categories = createCategories();
  const insertedCategories = await insertCategories(categories);

  const dishRows = createDishes(insertedCategories);
  const insertedDishes = await insertDishes(dishRows);

  const pricingRows = createPricingRules(insertedDishes);
  const insertedPricingRules = await insertPricingRules(pricingRows);

  const auditRows = createAuditLogs(insertedDishes);
  const insertedAuditLogs = await insertAuditLogs(auditRows);

  const generatedUsers = createUsers();
  const createdUsers = await createAuthUsers(generatedUsers);

  console.log("✅ Demo seed complete.");
  console.log(`Inserted categories: ${insertedCategories.length}`);
  console.log(`Inserted dishes: ${insertedDishes.length}`);
  console.log(`Inserted pricing rules: ${insertedPricingRules.length}`);
  console.log(`Inserted audit logs: ${insertedAuditLogs.length}`);
  console.log(`Created auth users: ${createdUsers.length}`);

  if (createdUsers.length > 0) {
    console.log("\nDemo user credentials:");
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} | Password: ${user.password} | Role: ${user.role}`);
    });
  } else {
    console.log("\nNo Supabase auth users were created because SUPABASE_SERVICE_ROLE_KEY was not configured.");
    console.log("You can still use these demo credentials in local/dev testing:");
    generatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} | Password: ${user.password} | Role: ${user.role}`);
    });
  }

  console.log("\nSample generated dish count:", insertedDishes.length);

  if (options.dryRun) {
    console.log("Dry run completed.");
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
