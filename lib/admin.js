import { createClient } from '@supabase/supabase-js';

export function isAdminRequest(request, bodyPassword) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const supplied = request.headers.get('x-admin-password') || bodyPassword;
  return Boolean(expected && supplied && supplied === expected);
}

export function getAdminSupabase() {
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (!url || !key) throw new Error('إعدادات Supabase الإدارية غير مكتملة.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
