import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Chakra_Petch, Unbounded } from 'next/font/google';
import './globals.css';

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin'],
});

const chakra = Chakra_Petch({
  variable: '--font-chakra',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'AXIOM',
  description: 'An infinite 3D god-mode bullet hell. You are the Unbound. The world answers, forever.',
};

export const viewport: Viewport = {
  themeColor: '#05070D',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${chakra.variable} h-full antialiased`}>
      <body className="min-h-full bg-void text-core">{children}</body>
    </html>
  );
}
