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
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    const title = String(form.get('title') || '').trim();
    const course_name = String(form.get('course_name') || '').trim();
    const course_code = String(form.get('course_code') || '').trim();
    const major = String(form.get('major') || '');
    const category = String(form.get('category') || '');
    if (!title || !course_name || !course_code || !file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'يرجى تعبئة جميع الحقول واختيار ملف PDF أو ZIP.' }, { status: 400 });
    const originalName = String(file.name || '').trim();
    const extension = originalName.match(/\.(pdf|zip)$/i)?.[0] || '';
    const normalizedExtension = extension.toLowerCase();
    const contentType = normalizedExtension === '.pdf' ? 'application/pdf' : normalizedExtension === '.zip' ? 'application/zip' : '';
    const validMime = normalizedExtension === '.pdf'
      ? (!file.type || file.type === 'application/pdf')
      : normalizedExtension === '.zip'
        ? (!file.type || ['application/zip', 'application/x-zip-compressed'].includes(file.type))
        : false;
    if (!extension || !validMime || file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'الملف يجب أن يكون PDF أو ZIP صالحاً وألا يتجاوز 50 ميغابايت.' }, { status: 400 });
    if (!['CS', 'SE', 'CIS', 'CYS', 'CORE'].includes(major) || !['ملخص', 'سلايدات', 'سنوات سابقة'].includes(category)) return NextResponse.json({ error: 'التخصص أو نوع المصدر غير صالح.' }, { status: 400 });
    const supabase = getAdminSupabase();
    const path = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const { error: uploadError } = await supabase.storage.from('summaries').upload(path, Buffer.from(await file.arrayBuffer()), { contentType, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from('summaries').getPublicUrl(path);
    const { data, error } = await supabase.from('summaries').insert({ title, course_name, course_code, major, category, file_url: publicData.publicUrl }).select().single();
    if (error) { await supabase.storage.from('summaries').remove([path]); throw error; }
    return NextResponse.json({ summary: data }, { status: 201 });
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
