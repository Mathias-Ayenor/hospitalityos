/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check and handle missing keys gracefully in development
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are not fully configured in your environment variables. " +
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file."
  );
}

// Create the Supabase client (only if credentials are provided)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Placeholder for backend-specific Service Role Key usage.
 * As per guidelines and security precautions, the Service Role Key is never exposed 
 * to frontend code and is represented by safe placeholder structures on any server routes.
 */
export const getSupabaseServiceRoleKeyPlaceholder = () => {
  // If a server-side route needs to perform administrative actions, it would use 
  // process.env.SUPABASE_SERVICE_ROLE_KEY (which points to our secure server-side env)
  return "placeholder_service_role_key_safeguard";
};
