import { createClient } from '@supabase/supabase-js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function isAdmin(request, env, bodyPassword) {
  const expected = env.ADMIN_PASSWORD || env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const supplied = request.headers.get('x-admin-password') || bodyPassword;
  return Boolean(expected && supplied && supplied === expected);
}

function getAdminSupabase(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('إعدادات Supabase الإدارية غير مكتملة.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return json({ error: 'بيانات الدخول غير صحيحة.' }, 401);
  try {
    const { data, error } = await getAdminSupabase(env).from('summaries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return json({ summaries: data || [] });
  } catch (error) {
    return json({ error: error.message || 'تعذر تحميل البيانات.' }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();
    if (!isAdmin(request, env, payload.password)) return json({ error: 'بيانات الدخول غير صحيحة.' }, 401);
    const supabase = getAdminSupabase(env);

    if (payload.action === 'create-upload-url') {
      const fileName = String(payload.fileName || '');
      const extension = fileName.match(/\.([a-z0-9]{1,10})$/i)?.[1].toLowerCase() || 'bin';
      const path = `files/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { data, error } = await supabase.storage.from('summaries').createSignedUploadUrl(path);
      if (error) throw error;
      const { data: publicData } = supabase.storage.from('summaries').getPublicUrl(path);
      return json({ signedUrl: data.signedUrl, token: data.token, path: data.path || path, publicUrl: publicData.publicUrl });
    }

    if (payload.action === 'save-record') {
      const title = String(payload.title || '').trim();
      const course_name = String(payload.course_name || '').trim();
      const course_code = String(payload.course_code || '').trim();
      const major = String(payload.major || '');
      const category = String(payload.category || '');
      const file_url = String(payload.file_url || '');
      if (!title || !course_name || !course_code || !file_url) return json({ error: 'يرجى تعبئة جميع الحقول ورفع الملف.' }, 400);
      if (!['CS', 'SE', 'CIS', 'CYS', 'CORE'].includes(major) || !['ملخص', 'سلايدات', 'سنوات سابقة'].includes(category)) return json({ error: 'التخصص أو نوع المصدر غير صالح.' }, 400);
      const { data, error } = await supabase.from('summaries').insert({ title, course_name, course_code, major, category, file_url }).select().single();
      if (error) throw error;
      return json({ summary: data }, 201);
    }

    return json({ error: 'نوع العملية غير معروف.' }, 400);
  } catch (error) {
    return json({ error: error.message || 'تعذر رفع الملف.' }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!isAdmin(request, env)) return json({ error: 'بيانات الدخول غير صحيحة.' }, 401);
  try {
    const { id } = await request.json();
    if (!id) return json({ error: 'معرّف الملخص مطلوب.' }, 400);
    const supabase = getAdminSupabase(env);
    const { data: summary, error: lookupError } = await supabase.from('summaries').select('id,file_url').eq('id', id).single();
    if (lookupError) throw lookupError;
    const { error: rowError } = await supabase.from('summaries').delete().eq('id', id);
    if (rowError) throw rowError;
    const marker = '/storage/v1/object/public/summaries/';
    const path = new URL(summary.file_url).pathname.split(marker)[1];
    if (path) {
      const { error: storageError } = await supabase.storage.from('summaries').remove([decodeURIComponent(path)]);
      if (storageError) return json({ deleted: true, warning: 'حُذف السجل وتعذر حذف الملف من التخزين.' });
    }
    return json({ deleted: true });
  } catch (error) {
    return json({ error: error.message || 'تعذر حذف الملخص.' }, 500);
  }
}
