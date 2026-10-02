// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import 'dotenv/config';
import { supabase } from './lib/supabaseClient.js';
import { faker } from '@faker-js/faker';

// ==========================================
// 2. SEED FUNCTION: MOCK DISHES
// ==========================================
// Generates and inserts 20 realistic fake dishes into the Supabase database
async function seedData() {
  console.log('Seeding fake data...');

  // --- Step 1: Fetch Existing Categories ---
  const { data: categories, error: catError } = await supabase.from('categories').select('id');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  if (!categories || categories.length === 0) {
    console.warn('No categories found. Please run your SQL schema first.');
    return;
  }

  // --- Step 2: Generate Mock Dish Records ---
  const newDishes = [];
  const emojis = ['🍔', '🍕', '🥗', '🍗', '🍜', '🍣', '🍛', '🍰', '🍹', '🌮'];
  const statuses = ['In Stock', 'Low Stock', 'Sold Out'];

  for (let i = 0; i < 20; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const stock = faker.number.int({ min: 0, max: 100 });
    let status = 'In Stock';
    if (stock === 0) status = 'Sold Out';
    else if (stock < 10) status = 'Low Stock';

    newDishes.push({
      name: faker.commerce.productName(),
      zomato_id: `ZOMATO-FAKE-${faker.string.alphanumeric(6).toUpperCase()}`,
      category_id: randomCategory.id,
      description: faker.commerce.productDescription(),
      image_url: faker.image.urlLoremFlickr({ category: 'food', width: 640, height: 480 }),
      dish_emoji: faker.helpers.arrayElement(emojis),
      base_price: parseFloat(faker.commerce.price({ min: 50, max: 1000 })),
      live_stock: stock,
      min_stock_threshold: faker.number.int({ min: 5, max: 15 }),
      zomato_status: status,
      sys_state: 'Idle',
      is_available: true
    });
  }

  // --- Step 3: Insert Records into Database ---
  const { data, error } = await supabase.from('dishes').insert(newDishes).select();

  if (error) {
    console.error('Error inserting dishes:', error);
  } else {
    console.log(`Successfully added ${data.length} fake dishes!`);
  }
}

// ==========================================
// 3. SCRIPT EXECUTION
// ==========================================
seedData();
