import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MainnetConfig,
  RelayerWeb,
  SepoliaConfig,
  ZamaProvider,
  indexedDBStorage,
} from "@zama-fhe/react-sdk";
import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi";
import { type ReactNode, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { MAINNET_RPC, SEPOLIA_RPC } from "./config";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(MAINNET_RPC),
    [sepolia.id]: http(SEPOLIA_RPC),
  },
});

const wagmiSigner = new WagmiSigner({ config: wagmiConfig });

const relayer = new RelayerWeb({
  getChainId: () => wagmiSigner.getChainId(),
  transports: {
    [mainnet.id]: { ...MainnetConfig, network: MAINNET_RPC },
    [sepolia.id]: { ...SepoliaConfig, network: SEPOLIA_RPC },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider relayer={relayer} signer={wagmiSigner} storage={indexedDBStorage}>
          {children}
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
