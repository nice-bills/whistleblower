import { createContext, useContext, useState, type ReactNode } from "react";
import type { SupportedChainId } from "../config";

const ViewChainContext = createContext<{
  viewChainId: SupportedChainId;
  setViewChainId: (id: SupportedChainId) => void;
} | null>(null);

export function ViewChainProvider({ children }: { children: ReactNode }) {
  const [viewChainId, setViewChainId] = useState<SupportedChainId>(11155111);
  return (
    <ViewChainContext.Provider value={{ viewChainId, setViewChainId }}>{children}</ViewChainContext.Provider>
  );
}

export function useViewChain() {
  const ctx = useContext(ViewChainContext);
  if (!ctx) throw new Error("useViewChain must be used within ViewChainProvider");
  return ctx;
}

/** Wallet chain when connected; otherwise the header “view” chain for read-only registry. */
export function useActiveChainId(walletChainId: number | undefined, isConnected: boolean): SupportedChainId {
  const { viewChainId } = useViewChain();
  if (isConnected && walletChainId === 1) return 1;
  if (isConnected && walletChainId === 11155111) return 11155111;
  return viewChainId;
}
