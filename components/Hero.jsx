import { BookOpen, GraduationCap, Layers3 } from 'lucide-react';
import Image from 'next/image';

export default function Hero({ stats }) {
  const items = [
    { label: 'ملخصاً متاحاً', value: stats.summaries, icon: BookOpen, color: 'text-cyan-300' },
    { label: 'مادة دراسية', value: stats.courses, icon: Layers3, color: 'text-blue-300' },
    { label: 'تخصصات أكاديمية', value: stats.majors, icon: GraduationCap, color: 'text-amber-300' },
  ];
  return <section className="relative isolate overflow-hidden border-b border-slate-800/70">
    <div className="hero-glow grid-pattern absolute inset-0 -z-10 animate-pulse-glow" /><div className="absolute -top-32 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[.06] px-4 py-2 text-xs font-bold text-cyan-200 sm:text-sm"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#06b6d4]" />مبادرة أنت قدها والكلية معك</div>
      <div className="mx-auto mt-7 w-full max-w-3xl rounded-2xl border border-slate-700/50 bg-white p-2 shadow-lg sm:p-3">
        <Image src="/college-banner.jpeg" alt="مبادرة أنت قدها والكلية معك - كلية تكنولوجيا المعلومات" width={1232} height={295} priority className="h-auto w-full rounded-xl object-contain" />
      </div>
      <h1 className="mx-auto mt-7 max-w-4xl text-3xl font-extrabold leading-[1.45] text-white sm:text-5xl sm:leading-[1.35]">المنصة الشاملة للملخصات <span className="bg-gradient-to-l from-cyan-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">والمصادر الدراسية</span></h1>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base">ضمن مبادرة أنت قدها والكلية معك، بوابتك الرقمية للوصول السريع إلى ملخصات المواد، السلايدات، وأسئلة السنوات السابقة لجميع تخصصات الكلية.</p>
      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {items.map(({ label, value, icon: Icon, color }) => <div key={label} className="glass flex items-center gap-4 rounded-2xl px-5 py-4 text-right shadow-glow sm:flex-col sm:gap-2 sm:text-center"><span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 ${color}`}><Icon size={19} /></span><div><div className="text-2xl font-extrabold text-white">{value}</div><div className="text-xs text-slate-400">{label}</div></div></div>)}
      </div>
    </div>
  </section>;
}
