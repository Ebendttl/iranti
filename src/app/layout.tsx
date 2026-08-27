'use client';

import React, { useState } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import { SUI_TESTNET_RPC_URL } from '@/lib/sui_client';

const { networkConfig } = createNetworkConfig({
  testnet: { url: SUI_TESTNET_RPC_URL },
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443' },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" className="dark">
      <head>
        <title>Ìrántí — Customer Memory Agent for WhatsApp Sellers</title>
        <meta name="description" content="AI sales assistant built on Walrus Memory (MemWal) and Sui Blockchain for Lagos WhatsApp sellers." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#07090e] text-gray-100 antialiased selection:bg-amber-500 selection:text-black">
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              {children}
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
