import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to get credentials from file if env vars are missing
function getCredentials() {
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }

  try {
    const settingsPath = path.join(process.cwd(), 'src/data/settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      if (settings.supabaseUrl && settings.supabaseAnonKey) {
        return { url: settings.supabaseUrl, key: settings.supabaseAnonKey };
      }
    }
  } catch (e) {
    // Ignore file read errors
  }

  return { url: '', key: '' };
}

// We export a function to get the client because the credentials might change
// or be loaded asynchronously/from file.
export const getSupabase = () => {
  const { url, key } = getCredentials();
  
  if (!url || !key) {
    // Return a dummy client or throw specific error that UI can handle
    // For now, we return a client that will fail if used, but won't crash the app startup
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }

  return createClient(url, key);
};

// Maintain backward compatibility for existing imports (though they should update)
export const supabase = getSupabase();
