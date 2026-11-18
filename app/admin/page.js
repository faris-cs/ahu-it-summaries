'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FilePlus2, FileText, LockKeyhole, LogOut, Search, ShieldCheck, Trash2, UploadCloud, X } from 'lucide-react';
import { MAJORS, formatArabicDate } from '@/components/SummaryCard';

const PASSWORD_KEY = 'ahu-admin-password';
const majors = [['CS', 'علم الحاسوب (CS)'], ['SE', 'هندسة البرمجيات (SE)'], ['CIS', 'نظم المعلومات الحاسوبية (CIS)'], ['CYS', 'الأمن السيبراني (CYS)'], ['CORE', 'متطلبات الكلية']];
const categories = ['ملخص', 'سلايدات', 'سنوات سابقة'];
const blank = { title: '', course_name: '', course_code: '', major: 'CS', category: 'ملخص' };

function bytes(size) { return size < 1024 * 1024 ? `${(size / 1024).toFixed(0)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`; }
function fileExtension(fileName) { return fileName.toLowerCase().endsWith('.zip') ? '.zip' : fileName.toLowerCase().endsWith('.pdf') ? '.pdf' : ''; }
function isSupportedFile(file) {
  const extension = fileExtension(file.name || '');
  if (extension === '.pdf') return !file.type || file.type === 'application/pdf';
  if (extension === '.zip') return !file.type || ['application/zip', 'application/x-zip-compressed'].includes(file.type);
  return false;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginBusy, setLoginBusy] = useState(false);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const request = useCallback(async (path, options = {}) => {
    const saved = sessionStorage.getItem(PASSWORD_KEY) || password;
    const response = await fetch(path, { ...options, headers: { ...(options.headers || {}), 'x-admin-password': saved } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'حدث خطأ غير متوقع.');
    return data;
  }, [password]);

  const load = useCallback(async () => {
    const data = await request('/api/admin/summaries');
    setItems(data.summaries || []);
  }, [request]);

  useEffect(() => {
    const saved = sessionStorage.getItem(PASSWORD_KEY);
    if (!saved) { setChecking(false); return; }
    setPassword(saved);
    fetch('/api/admin/summaries', { headers: { 'x-admin-password': saved } }).then(async (r) => {
      if (r.ok) { const data = await r.json(); setItems(data.summaries || []); setAuthenticated(true); }
      else sessionStorage.removeItem(PASSWORD_KEY);
    }).catch(() => {}).finally(() => setChecking(false));
  }, []);

  async function login(event) {
    event.preventDefault(); setLoginBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/summaries', { headers: { 'x-admin-password': password } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذر تسجيل الدخول.');
      sessionStorage.setItem(PASSWORD_KEY, password); setItems(data.summaries || []); setAuthenticated(true);
    } catch (e) { setError(e.message); }
    finally { setLoginBusy(false); setChecking(false); }
  }

  function chooseFile(candidate) {
    setError('');
    if (!candidate) return;
    if (!isSupportedFile(candidate)) { setError('يرجى اختيار ملف PDF أو ZIP صالح.'); return; }
    if (candidate.size > 50 * 1024 * 1024) { setError('حجم الملف يتجاوز الحد الأقصى (50 ميغابايت).'); return; }
    setFile(candidate);
  }

  async function upload(event) {
    event.preventDefault(); if (!file) { setError('اختر ملف PDF أو ZIP أولاً.'); return; }
    setBusy(true); setError(''); setMessage('جارٍ رفع الملف وحفظ بياناته…');
    try {
      const data = new FormData(); Object.entries(form).forEach(([key, value]) => data.append(key, value)); data.append('file', file);
      await request('/api/admin/summaries', { method: 'POST', body: data });
      setMessage('تم رفع الملخص بنجاح.'); setForm(blank); setFile(null); if (inputRef.current) inputRef.current.value = ''; await load();
    } catch (e) { setMessage(''); setError(e.message); }
    finally { setBusy(false); }
  }

  async function remove(item) {
    if (!window.confirm(`هل تريد حذف «${item.title}»؟ سيتم حذف الملف أيضاً.`)) return;
    setDeleting(item.id); setError(''); setMessage('');
    try { const result = await request('/api/admin/summaries', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) }); await load(); if (result.warning) setError(result.warning); }
    catch (e) { setError(e.message); }
    finally { setDeleting(''); }
  }

  function logout() { sessionStorage.removeItem(PASSWORD_KEY); setAuthenticated(false); setPassword(''); setItems([]); }

  if (checking) return <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" aria-label="جارٍ التحقق"/></main>;
  if (!authenticated) return <main className="mx-auto flex min-h-[78vh] max-w-7xl items-center justify-center px-4 py-12"><form onSubmit={login} className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f172a] p-7 shadow-2xl shadow-black/20 sm:p-9"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[.08] text-amber-300"><LockKeyhole size={25}/></div><h1 className="mt-5 text-center text-2xl font-extrabold text-white">بوابة إدارة المحتوى</h1><p className="mt-2 text-center text-sm text-slate-400">أدخل كلمة المرور للمتابعة إلى مكتبة الملخصات.</p><label className="mt-7 block text-sm font-semibold text-slate-300">كلمة المرور<input autoFocus type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#060b14] px-4 py-3 text-white outline-none focus:border-cyan-500/60" placeholder="••••••••••" required/></label>{error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}<button disabled={loginBusy} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:opacity-60">{loginBusy ? 'جارٍ التحقق…' : 'تسجيل الدخول'}</button><Link href="/" className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300"><ArrowRight size={14}/> العودة إلى المنصة</Link></form></main>;

  const visibleItems = items.filter((item) => `${item.title} ${item.course_name} ${item.course_code} ${item.major}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="mx-auto min-h-[80vh] max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-cyan-300"><ShieldCheck size={15}/> إدارة آمنة للمحتوى</div><h1 className="text-2xl font-extrabold text-white sm:text-3xl">استوديو الملخصات</h1><p className="mt-2 text-sm text-slate-400">إضافة المواد وتنظيم مكتبة المصادر الأكاديمية.</p></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:text-white"><LogOut size={16}/> تسجيل الخروج</button></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/[.06] px-4 py-3 text-sm text-rose-200">{error}</div>}{message && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[.06] px-4 py-3 text-sm text-emerald-200">{!busy && <CheckCircle2 size={17}/ >}{message}</div>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.15fr]">
      <section className="h-fit rounded-2xl border border-slate-800 bg-[#0f172a] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><FilePlus2 size={19}/></span><div><h2 className="font-bold text-white">إضافة ملخص جديد</h2><p className="text-xs text-slate-500">أدخل بيانات المصدر ثم ارفع ملف PDF أو ZIP.</p></div></div>
        <form onSubmit={upload} className="space-y-4"><label className="block text-xs font-semibold text-slate-400">عنوان الملخص<input required value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} placeholder="ملخص شابتر 1 و 2 - شامل" className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080e19] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"/></label>
          <label className="block text-xs font-semibold text-slate-400">اسم المادة<input required value={form.course_name} onChange={(e) => setForm({...form, course_name:e.target.value})} placeholder="هياكل البيانات - Data Structures" className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080e19] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50"/></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-slate-400">رمز المادة<input required dir="ltr" value={form.course_code} onChange={(e) => setForm({...form, course_code:e.target.value.toUpperCase()})} placeholder="CS211" className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080e19] px-3.5 py-3 text-sm font-mono text-white outline-none focus:border-cyan-500/50"/></label><label className="block text-xs font-semibold text-slate-400">التخصص<select value={form.major} onChange={(e) => setForm({...form, major:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080e19] px-3 py-3 text-xs text-white outline-none focus:border-cyan-500/50">{majors.map(([key, name])=><option key={key} value={key}>{name}</option>)}</select></label></div>
          <label className="block text-xs font-semibold text-slate-400">نوع المصدر<select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080e19] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50">{categories.map((name)=><option key={name}>{name}</option>)}</select></label>
          <div onDragOver={(e)=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={(e)=>{e.preventDefault();setDragging(false);chooseFile(e.dataTransfer.files?.[0]);}} onClick={()=>inputRef.current?.click()} className={`cursor-pointer rounded-xl border border-dashed px-4 py-6 text-center transition ${dragging ? 'border-cyan-400 bg-cyan-400/[.06]' : 'border-slate-700 bg-[#080e19] hover:border-slate-500'}`}><input ref={inputRef} type="file" accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed" className="hidden" onChange={(e)=>chooseFile(e.target.files?.[0])}/>{file ? <div className="flex items-center justify-between gap-3 text-right"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-400/10 text-rose-300"><FileText size={19}/></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{file.name}</p><p className="mt-1 text-xs text-slate-500">{bytes(file.size)}</p></div></div><button type="button" aria-label="إزالة الملف" onClick={(e)=>{e.stopPropagation();setFile(null);if(inputRef.current)inputRef.current.value='';}} className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"><X size={17}/></button></div> : <><UploadCloud className="mx-auto text-cyan-300" size={25}/><p className="mt-3 text-sm font-semibold text-slate-300">اسحب ملف PDF أو ZIP وأفلته هنا</p><p className="mt-1 text-xs text-slate-500">أو انقر لاختيار ملف · الحد الأقصى 50 ميغابايت</p></>}</div>
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"><UploadCloud size={17}/>{busy ? 'جارٍ الرفع…' : 'رفع الملخص'}</button>
        </form>
      </section>
      <section className="min-w-0 rounded-2xl border border-slate-800 bg-[#0f172a] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-white">إدارة المحتوى</h2><p className="mt-1 text-xs text-slate-500">{items.length} ملف في المكتبة</p></div><label className="relative w-full sm:w-56"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="بحث في المحتوى" className="w-full rounded-lg border border-slate-700 bg-[#080e19] py-2 pl-3 pr-9 text-xs text-white outline-none focus:border-cyan-500/50"/></label></div>
        <div className="scrollbar-thin mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-right text-xs"><thead><tr className="border-b border-slate-800 text-slate-500"><th className="pb-3 pl-3 font-semibold">الملخص / المادة</th><th className="pb-3 pl-3 font-semibold">الرمز</th><th className="pb-3 pl-3 font-semibold">التخصص</th><th className="pb-3 pl-3 font-semibold">تاريخ الرفع</th><th className="pb-3 font-semibold">إجراء</th></tr></thead><tbody>{visibleItems.map((item)=><tr key={item.id} className="border-b border-slate-800/70 last:border-0"><td className="py-4 pl-3"><p className="max-w-48 truncate font-bold text-slate-200">{item.title}</p><p className="mt-1 max-w-48 truncate text-slate-500">{item.course_name}</p></td><td className="py-4 pl-3 font-mono text-slate-300" dir="ltr">{item.course_code}</td><td className="py-4 pl-3 text-slate-400">{MAJORS[item.major] || item.major}</td><td className="py-4 pl-3 text-slate-500">{formatArabicDate(item.created_at)}</td><td className="py-4"><button disabled={deleting===item.id} onClick={()=>remove(item)} aria-label={`حذف ${item.title}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40">{deleting===item.id ? <span className="block h-4 w-4 animate-spin rounded-full border border-slate-600 border-t-rose-300"/> : <Trash2 size={16}/>}</button></td></tr>)}</tbody></table>{visibleItems.length===0 && <div className="py-12 text-center text-sm text-slate-500">لا توجد ملفات مطابقة للبحث.</div>}</div>
      </section>
    </div>
  </main>;
}
