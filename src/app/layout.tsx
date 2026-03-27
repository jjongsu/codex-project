import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import './globals.css';

const bodyFont = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Retro Casual Web Portal',
  description:
    'A modern browser arcade portal built around Block Jam Blitz, Snake Survivor, and Brick Shot Rush.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className={bodyFont.variable}>
        <div className="min-h-screen">
          <SiteHeader />
          <main id="site-main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
