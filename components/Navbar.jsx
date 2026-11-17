import Link from 'next/link';
import { BookOpenCheck, Shield } from 'lucide-react';

export default function Navbar() {
  return <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060b14]/80 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6" aria-label="التنقل الرئيسي">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-blue-600/30 to-cyan-500/10 text-cyan-300"><BookOpenCheck size={22} /></span>
        <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-white sm:text-base">كلية تكنولوجيا المعلومات</span><span className="block truncate text-xs text-slate-400">جامعة الحسين بن طلال</span></span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/#summaries" className="hidden text-sm font-semibold text-slate-300 transition hover:text-cyan-300 sm:block">تصفح الملخصات</Link>
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-400/40 hover:text-amber-300 sm:text-sm"><Shield size={15} /> بوابة الإدارة</Link>
      </div>
    </nav>
  </header>;
}
