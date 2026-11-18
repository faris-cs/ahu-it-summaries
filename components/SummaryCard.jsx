'use client';
import { CalendarDays, Download, Eye, FileText } from 'lucide-react';

export const MAJORS = { CS: 'علم الحاسوب', SE: 'هندسة البرمجيات', CIS: 'نظم المعلومات الحاسوبية', CYS: 'الأمن السيبراني', CORE: 'متطلبات الكلية' };

export function formatArabicDate(date) {
  try { return new Intl.DateTimeFormat('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date)); }
  catch { return '—'; }
}

export function downloadUrl(url, title) {
  const extension = getFileExtension(url);
  const name = `${title || 'ملخص'} - AHU${extension ? `.${extension.toLowerCase()}` : ''}`;
  try { const parsed = new URL(url); parsed.searchParams.set('download', name); return parsed.toString(); }
  catch { return url; }
}

export function getFileExtension(url = '') {
  try {
    const fileName = decodeURIComponent(new URL(url, 'https://local.invalid').pathname.split('/').pop() || '');
    return fileName.match(/\.([^.]+)$/)?.[1]?.toUpperCase() || '';
  } catch { return String(url).split(/[?#]/)[0].match(/\.([^.\/]+)$/)?.[1]?.toUpperCase() || ''; }
}

export function isPdfFile(url = '') {
  return getFileExtension(url) === 'PDF';
}

export default function SummaryCard({ summary, onPreview }) {
  const major = MAJORS[summary.major] || summary.major;
  const fileExtension = getFileExtension(summary.file_url);
  const isPdf = isPdfFile(summary.file_url);
  return <article className="card-hover flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0f172a] p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-200">{major}</span>
      <div className="flex items-center gap-2">{!isPdf && <span className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-extrabold tracking-wide text-cyan-200" dir="ltr">{fileExtension || 'FILE'}</span>}<span className="rounded-lg border border-amber-400/20 bg-amber-400/[.07] px-2.5 py-1 text-xs font-semibold text-amber-200">{summary.category}</span><span className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-300" dir="ltr">{summary.course_code}</span></div>
    </div>
    <div className="mt-6 flex flex-1 flex-col"><div className="flex items-start gap-3"><span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><FileText size={18} /></span><div><h2 className="text-base font-extrabold leading-7 text-white">{summary.course_name}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{summary.title}</p></div></div>
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14} /><time dateTime={summary.created_at}>{formatArabicDate(summary.created_at)}</time></div></div>
    {isPdf ? <div className="mt-6 grid grid-cols-2 gap-2"><button onClick={() => onPreview(summary)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-xs font-bold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200 sm:text-sm"><Eye size={16} /> معاينة الملخص</button><a href={downloadUrl(summary.file_url, summary.title)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-blue-500 sm:text-sm"><Download size={16} /> تحميل PDF</a></div> : <a href={downloadUrl(summary.file_url, summary.title)} download target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-cyan-500"><Download size={16} /> تحميل الملف {fileExtension && `(${fileExtension})`}</a>}
  </article>;
}
