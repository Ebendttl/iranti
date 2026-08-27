'use client';

import React, { useState } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SUI_TESTNET_RPC_URL } from '@/lib/sui_client';

const { networkConfig } = createNetworkConfig({
  testnet: { url: SUI_TESTNET_RPC_URL },
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443' },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
