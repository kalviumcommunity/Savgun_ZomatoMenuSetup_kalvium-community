// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { createClient } from "@supabase/supabase-js";

// ==========================================
// 2. CONFIGURATION & ENVIRONMENT VARIABLES
// ==========================================
// Public URL and anonymous API key for client-side Supabase operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that required public environment variables are present and configured
if (!supabaseUrl || supabaseUrl === "https://your-project-id.supabase.co") {
  throw new Error("Missing or invalid NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key-here") {
  throw new Error("Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// ==========================================
// 3. CLIENT INSTANTIATION & EXPORTS
// ==========================================
// Standard client instance for public / user-level database operations
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Helper function to check if Supabase connection credentials are configured
export const isSupabaseConfigured = () => true;

// Factory function to obtain admin client with service-role permissions (server-only)
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey === "your-service-role-key-here") {
    throw new Error("Missing or invalid SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

export default supabase;

