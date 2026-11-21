import Link from 'next/link';
import Image from 'next/image';
import { Shield } from 'lucide-react';

export default function Navbar() {
  return <header className="safe-area-top sticky top-0 z-40 border-b border-slate-800/80 bg-[#060b14]/95">
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6" aria-label="التنقل الرئيسي">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Image src="/initiative-logo.jpeg" alt="شعار مبادرة أنت قدها والكلية معك" width={44} height={44} priority className="h-11 w-11 shrink-0 rounded-xl bg-white p-1 object-contain shadow-sm" />
        <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-white sm:text-base">كلية تكنولوجيا المعلومات</span><span className="block truncate text-xs text-slate-400">جامعة الحسين بن طلال</span></span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/#summaries" className="hidden text-sm font-semibold text-slate-300 transition hover:text-cyan-300 sm:block">تصفح الملخصات</Link>
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-400/40 hover:text-amber-300 sm:text-sm"><Shield size={15} /> بوابة الإدارة</Link>
      </div>
    </nav>
  </header>;
}
