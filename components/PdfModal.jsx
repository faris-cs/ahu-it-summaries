'use client';
import { useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { downloadUrl, isPdfFile } from './SummaryCard';

export default function PdfModal({ summary, onClose }) {
  useEffect(() => {
    if (!summary || !isPdfFile(summary.file_url)) return;
    const close = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [summary, onClose]);
  if (!summary || !isPdfFile(summary.file_url)) return null;
  const src = `${summary.file_url}${summary.file_url.includes('#') ? '' : '#toolbar=1&navpanes=0'}`;
  return <div className="fixed inset-0 z-50 flex flex-col bg-[#050912]" role="dialog" aria-modal="true" aria-label={`معاينة ${summary.title}`}>
    <div className="safe-area-top flex min-h-16 items-center justify-between gap-4 border-b border-slate-800 bg-[#0f172a] px-4 py-3 sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{summary.title}</p><p className="truncate text-xs text-slate-400">{summary.course_name}</p></div><div className="flex shrink-0 items-center gap-2"><a href={downloadUrl(summary.file_url, summary.title)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-cyan-200"><ExternalLink size={15} /><span className="hidden sm:inline">فتح في نافذة خارجية</span></a><button onClick={onClose} aria-label="إغلاق المعاينة" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={20} /></button></div></div>
    <iframe title={`ملف PDF: ${summary.title}`} src={src} className="h-full w-full flex-1 bg-slate-900" />
  </div>;
}
