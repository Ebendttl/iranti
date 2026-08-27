import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Ìrántí — Customer Memory Agent for WhatsApp Sellers',
  description: 'AI sales assistant built on Walrus Memory (MemWal) and Sui Blockchain for Lagos WhatsApp sellers.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#07090e] text-gray-100 antialiased selection:bg-amber-500 selection:text-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
