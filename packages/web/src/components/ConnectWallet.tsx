import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { isSupportedChainId, type SupportedChainId } from "../config";
import { useViewChain } from "../context/ViewChainContext";

function ChainPills({
  activeId,
  onSelect,
  disabled,
}: {
  activeId: SupportedChainId;
  onSelect: (id: SupportedChainId) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="hidden items-center gap-0.5 rounded-full bg-neutral-800/80 p-0.5 sm:flex"
      role="group"
      aria-label="Network"
    >
      {([sepolia, mainnet] as const).map((chain) => (
        <button
          key={chain.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chain.id)}
          className={[
            "rounded-full px-2.5 py-1 text-xs transition-colors",
            activeId === chain.id ? "bg-white text-black" : "text-neutral-300 hover:text-white",
          ].join(" ")}
        >
          {chain.id === sepolia.id ? "sepolia" : "mainnet"}
        </button>
      ))}
    </div>
  );
}

export default function ConnectWallet() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { viewChainId, setViewChainId } = useViewChain();

  const walletChainId =
    isConnected && chainId !== undefined && isSupportedChainId(chainId) ? chainId : viewChainId;

  function selectChain(id: SupportedChainId) {
    if (isConnected) {
      switchChain({ chainId: id });
    } else {
      setViewChainId(id);
    }
  }

  if (!isConnected) {
    const connector = connectors[0];
    return (
      <div className="flex items-center gap-2">
        <ChainPills activeId={walletChainId} onSelect={selectChain} disabled={isSwitching} />
        <button
          type="button"
          className="rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
          disabled={!connector || isPending}
          onClick={() => connector && connect({ connector })}
        >
          {isPending ? "connecting…" : "connect wallet"}
        </button>
      </div>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;
  const onSupported = chainId !== undefined && isSupportedChainId(chainId);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span
        className="rounded-full bg-neutral-900/90 px-4 py-2 font-mono text-xs text-white/80 backdrop-blur"
        title={address}
      >
        {short}
      </span>
      {!onSupported && (
        <button
          type="button"
          className="rounded-full border border-white/20 px-3 py-2 text-xs text-white transition-colors hover:bg-white/10"
          onClick={() => switchChain({ chainId: sepolia.id })}
        >
          use sepolia
        </button>
      )}
      <ChainPills activeId={walletChainId} onSelect={selectChain} disabled={isSwitching} />
      <button
        type="button"
        className="rounded-full border border-white/20 px-4 py-2 text-xs text-neutral-300 transition-colors hover:text-white"
        onClick={() => disconnect()}
      >
        disconnect
      </button>
    </div>
  );
}
