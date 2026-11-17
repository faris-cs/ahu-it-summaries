/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: { extend: { fontFamily: { sans: ['var(--font-cairo)', 'sans-serif'] }, colors: { ink: '#060b14', surface: '#0f172a', line: '#1e293b', royal: '#2563eb', cyan: '#06b6d4', gold: '#f59e0b' }, boxShadow: { glow: '0 0 40px rgba(6,182,212,.12)' } } },
  plugins: [],
};
