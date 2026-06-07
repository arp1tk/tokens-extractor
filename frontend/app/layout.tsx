import './globals.css';
import './site.css';
import Header from '@/components/layout/Header';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Tokn — tokenize any website',
  description:
    'Tokn turns any website into clean design-token JSON — colors, typography, spacing, shadows and a style profile — ready to hand to an AI to build from.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id="top">
        <Header />
        {children}
      </body>
    </html>
  );
}
