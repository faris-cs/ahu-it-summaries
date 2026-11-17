import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';

const majors = [['CS', 'علم الحاسوب'], ['SE', 'هندسة البرمجيات'], ['CIS', 'نظم المعلومات'], ['CYS', 'الأمن السيبراني']];
export default function Footer() {
  return <footer className="border-t border-slate-800 bg-[#080e19]"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-300"><BookOpenCheck size={19} /></span><div><p className="text-sm font-bold text-slate-200">كلية تكنولوجيا المعلومات - جامعة الحسين بن طلال (AHU)</p><p className="mt-1 text-xs text-slate-500">مصدر أكاديمي يجمع المعرفة في مكان واحد</p></div></div><div className="flex flex-wrap gap-x-4 gap-y-2">{majors.map(([code, label]) => <Link key={code} href={`/?major=${code}#summaries`} className="text-xs text-slate-500 transition hover:text-cyan-300">{label}</Link>)}</div></div><div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">تطوير وتصميم: <span className="text-cyan-300/80">فارس عبيدات</span></div></div></footer>;
}
