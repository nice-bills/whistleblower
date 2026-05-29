import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { isSupportedChainId } from "../config";

export default function ConnectWallet() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    const connector = connectors[0];
    return (
      <button
        type="button"
        className="btn primary"
        disabled={!connector || isPending}
        onClick={() => connector && connect({ connector })}
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;
  const onSupported = chainId !== undefined && isSupportedChainId(chainId);

  return (
    <div className="wallet-bar">
      <span className="wallet-address" title={address}>
        {short}
      </span>
      {!onSupported && (
        <button type="button" className="btn warn" onClick={() => switchChain({ chainId: sepolia.id })}>
          Switch to Sepolia
        </button>
      )}
      <div className="chain-switch">
        <button
          type="button"
          className={chainId === sepolia.id ? "chip active" : "chip"}
          onClick={() => switchChain({ chainId: sepolia.id })}
        >
          Sepolia
        </button>
        <button
          type="button"
          className={chainId === mainnet.id ? "chip active" : "chip"}
          onClick={() => switchChain({ chainId: mainnet.id })}
        >
          Mainnet
        </button>
      </div>
      <button type="button" className="btn ghost" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
