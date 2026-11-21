import { Cairo } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700', '800'], variable: '--font-cairo', display: 'swap' });

export const metadata = {
  title: 'ملخصات كلية تكنولوجيا المعلومات | جامعة الحسين بن طلال',
  description: 'بوابتك للوصول إلى ملخصات المواد والسلايدات وأسئلة السنوات السابقة في كلية تكنولوجيا المعلومات بجامعة الحسين بن طلال.',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'ملخصات AHU' },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#060b14',
};

export default function RootLayout({ children }) {
  return <html lang="ar" dir="rtl"><body className={cairo.variable}><Navbar />{children}<Footer /></body></html>;
}
