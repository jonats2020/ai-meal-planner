import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Access environment variables through Expo Constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                    process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log for debugging (remove in production)
console.log("Supabase URL available:", !!supabaseUrl);
console.log("Supabase Key available:", !!supabaseAnonKey);

// Initialize Supabase client (with safeguards for missing values)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export default supabase;