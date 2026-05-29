import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

/** Connects the wagmi mock account when VITE_DEMO_MOCK_WALLET is set (screen recording). */
export default function DemoAutoConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (import.meta.env.VITE_DEMO_MOCK_WALLET !== "true" || isConnected) return;
    const mockConnector = connectors.find((c) => c.id === "mock");
    if (mockConnector) connect({ connector: mockConnector });
  }, [connect, connectors, isConnected]);

  return null;
}
