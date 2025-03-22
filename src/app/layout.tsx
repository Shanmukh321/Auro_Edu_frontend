'use client'
import './globals.css';
import { useChatStore } from './lib/store';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useChatStore();
  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body>{children}</body>
    </html>
  );
}