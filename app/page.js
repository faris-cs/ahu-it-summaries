'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import Hero from '@/components/Hero';
import SummaryCard, { MAJORS } from '@/components/SummaryCard';
import PdfModal from '@/components/PdfModal';
import { supabase } from '@/lib/supabase';

const majorFilters = [['ALL', 'الكل'], ['CS', 'علم الحاسوب (CS)'], ['SE', 'هندسة البرمجيات (SE)'], ['CIS', 'نظم المعلومات الحاسوبية (CIS)'], ['CYS', 'الأمن السيبراني (CYS)'], ['CORE', 'متطلبات الكلية']];
const categories = [['ALL', 'الكل'], ['ملخص', 'ملخصات'], ['سلايدات', 'سلايدات'], ['سنوات سابقة', 'سنوات سابقة']];

function SkeletonCard() { return <div className="animate-pulse rounded-2xl border border-slate-800 bg-[#0f172a] p-6"><div className="flex justify-between"><div className="h-6 w-24 rounded-lg bg-slate-800"/><div className="h-6 w-32 rounded-lg bg-slate-800"/></div><div className="mt-8 h-5 w-2/3 rounded bg-slate-800"/><div className="mt-3 h-4 w-full rounded bg-slate-800"/><div className="mt-10 h-10 rounded-xl bg-slate-800"/></div>; }

export default function HomePage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [major, setMajor] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [preview, setPreview] = useState(null);
  const mounted = useRef(false);
  const activeRequest = useRef(null);

  const loadSummaries = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError('');
    if (!supabase) {
      setError('إعدادات المنصة غير مكتملة حالياً. حاول تحديث الصفحة لاحقاً.');
      setLoading(false);
      return;
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const requestState = { controller };
    activeRequest.current = requestState;
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => {
        if (controller) controller.abort();
        reject(new Error('summary request timed out'));
      }, 12000);
    });

    try {
      let queryRequest = supabase.from('summaries').select('*').order('created_at', { ascending: false });
      if (controller && typeof queryRequest.abortSignal === 'function') queryRequest = queryRequest.abortSignal(controller.signal);
      const { data, error: fetchError } = await Promise.race([queryRequest, timeout]);
      if (fetchError) throw fetchError;
      if (mounted.current && activeRequest.current === requestState) {
        setSummaries(data || []);
        setError('');
      }
    } catch (fetchError) {
      if (mounted.current && activeRequest.current === requestState) {
        setError('تعذر تحميل الملخصات حالياً. تحقق من اتصالك ثم أعد المحاولة.');
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (activeRequest.current === requestState) {
        activeRequest.current = null;
        if (mounted.current) setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadSummaries();
    return () => {
      mounted.current = false;
      if (activeRequest.current?.controller) activeRequest.current.controller.abort();
    };
  }, [loadSummaries]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('major') && majorFilters.some(([code]) => code === params.get('major'))) setMajor(params.get('major'));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ar');
    return summaries.filter((item) => {
      const matchesMajor = major === 'ALL' || item.major === major;
      const matchesCategory = category === 'ALL' || item.category === category;
      const searchable = `${item.course_name} ${item.course_code} ${item.title} ${MAJORS[item.major] || ''}`.toLocaleLowerCase('ar');
      return matchesMajor && matchesCategory && (!q || searchable.includes(q));
    });
  }, [summaries, major, category, query]);
  const stats = useMemo(() => ({ summaries: summaries.length, courses: new Set(summaries.map((x) => x.course_code)).size, majors: majorFilters.length - 1 }), [summaries]);

  return <main><Hero stats={stats} />
    <section id="summaries" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-cyan-300"><Sparkles size={15} /> مكتبة المصادر الدراسية</div><h2 className="text-2xl font-extrabold text-white sm:text-3xl">تصفح الملخصات</h2><p className="mt-2 text-sm text-slate-400">ابحث حسب اسم المادة أو رمزها أو عنوان الملف.</p></div><span className="text-xs text-slate-500">{loading ? 'جارٍ التحديث…' : `${filtered.length} نتيجة`}</span></div>
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5">
        <label className="relative block"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={19}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مادة، رمز مثل CS101، أو ملخص…" className="w-full rounded-xl border border-slate-700 bg-[#060b14] py-3.5 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10" /></label>
        <div className="mt-5"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-400"><SlidersHorizontal size={14}/> التخصص</div><div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">{majorFilters.map(([code, label]) => <button key={code} onClick={() => setMajor(code)} className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${major === code ? 'border-blue-500/50 bg-blue-600/15 text-blue-200' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'}`}>{label}</button>)}</div></div>
        <div className="mt-4"><div className="mb-3 text-xs font-bold text-slate-400">نوع المصدر</div><div className="flex flex-wrap gap-2">{categories.map(([code, label]) => <button key={code} onClick={() => setCategory(code)} className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${category === code ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/25' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>{label}</button>)}</div></div>
      </div>
      {error && <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[.06] p-4 text-sm text-amber-200"><span className="flex items-start gap-3"><AlertCircle size={18} className="mt-0.5 shrink-0"/>{error}</span><button onClick={loadSummaries} className="shrink-0 rounded-lg border border-amber-400/20 px-3 py-2 text-xs font-bold text-amber-100 transition hover:bg-amber-400/10">إعادة المحاولة</button></div>}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{loading ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i}/>) : filtered.map((summary) => <SummaryCard key={summary.id} summary={summary} onPreview={setPreview}/>)}</div>
      {!loading && !error && filtered.length === 0 && <div className="mt-7 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400"><Search size={24}/></span><h3 className="mt-5 text-lg font-bold text-slate-200">لا توجد نتائج مطابقة</h3><p className="mt-2 text-sm text-slate-500">جرّب تغيير كلمات البحث أو اختيار تخصص ونوع مصدر آخر.</p><button onClick={() => { setQuery(''); setMajor('ALL'); setCategory('ALL'); }} className="mt-5 text-sm font-bold text-cyan-300 hover:text-cyan-200">إعادة ضبط عوامل التصفية</button></div>}
    </section><PdfModal summary={preview} onClose={() => setPreview(null)}/>
  </main>;
}
