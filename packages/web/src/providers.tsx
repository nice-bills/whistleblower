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
import { injected, mock } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { MAINNET_RPC, SEPOLIA_RPC } from "./config";
import { ViewChainProvider } from "./context/ViewChainContext";

const demoMockWallet = import.meta.env.VITE_DEMO_MOCK_WALLET === "true";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: demoMockWallet
    ? [
        mock({
          accounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
          features: { defaultConnected: true },
        }),
        injected(),
      ]
    : [injected()],
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
          <ViewChainProvider>{children}</ViewChainProvider>
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
