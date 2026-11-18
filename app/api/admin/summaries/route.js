import { NextResponse } from 'next/server';
import { getAdminSupabase, isAdminRequest } from '@/lib/admin';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
  try {
    const { data, error } = await getAdminSupabase().from('summaries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ summaries: data || [] });
  } catch (error) { return NextResponse.json({ error: error.message || 'تعذر تحميل البيانات.' }, { status: 500 }); }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    if (!isAdminRequest(request, payload.password)) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
    const supabase = getAdminSupabase();
    if (payload.action === 'create-upload-url') {
      const fileName = String(payload.fileName || '');
      const extension = fileName.match(/\.([a-z0-9]{1,10})$/i)?.[1].toLowerCase() || 'bin';
      const path = `files/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { data, error } = await supabase.storage.from('summaries').createSignedUploadUrl(path);
      if (error) throw error;
      const { data: publicData } = supabase.storage.from('summaries').getPublicUrl(path);
      return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: data.path || path, publicUrl: publicData.publicUrl });
    }
    if (payload.action === 'save-record') {
      const title = String(payload.title || '').trim();
      const course_name = String(payload.course_name || '').trim();
      const course_code = String(payload.course_code || '').trim();
      const major = String(payload.major || '');
      const category = String(payload.category || '');
      const file_url = String(payload.file_url || '');
      if (!title || !course_name || !course_code || !file_url) return NextResponse.json({ error: 'يرجى تعبئة جميع الحقول ورفع الملف.' }, { status: 400 });
      if (!['CS', 'SE', 'CIS', 'CYS', 'CORE'].includes(major) || !['ملخص', 'سلايدات', 'سنوات سابقة'].includes(category)) return NextResponse.json({ error: 'التخصص أو نوع المصدر غير صالح.' }, { status: 400 });
      const { data, error } = await supabase.from('summaries').insert({ title, course_name, course_code, major, category, file_url }).select().single();
      if (error) throw error;
      return NextResponse.json({ summary: data }, { status: 201 });
    }
    return NextResponse.json({ error: 'نوع العملية غير معروف.' }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error.message || 'تعذر رفع الملف.' }, { status: 500 }); }
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'معرّف الملخص مطلوب.' }, { status: 400 });
    const supabase = getAdminSupabase();
    const { data: summary, error: lookupError } = await supabase.from('summaries').select('id,file_url').eq('id', id).single();
    if (lookupError) throw lookupError;
    const { error: rowError } = await supabase.from('summaries').delete().eq('id', id);
    if (rowError) throw rowError;
    const marker = '/storage/v1/object/public/summaries/';
    const path = summary.file_url.split(marker)[1];
    if (path) {
      const { error: storageError } = await supabase.storage.from('summaries').remove([decodeURIComponent(path)]);
      if (storageError) return NextResponse.json({ deleted: true, warning: 'حُذف السجل وتعذر حذف الملف من التخزين.' });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) { return NextResponse.json({ error: error.message || 'تعذر حذف الملخص.' }, { status: 500 }); }
}
