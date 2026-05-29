import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { isSupportedChainId, type SupportedChainId } from "../config";
import { useViewChain } from "../context/ViewChainContext";

function ChainPills({
  activeId,
  onSelect,
  disabled,
  compact,
}: {
  activeId: SupportedChainId;
  onSelect: (id: SupportedChainId) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-0.5 rounded-full bg-black/40 p-0.5",
        compact ? "flex" : "hidden sm:flex",
      ].join(" ")}
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
            "rounded-full px-2 py-1 text-[11px] transition-colors md:px-2.5 md:text-xs",
            activeId === chain.id ? "bg-white text-black" : "text-neutral-300 hover:text-white",
          ].join(" ")}
        >
          {chain.id === sepolia.id ? "sepolia" : "mainnet"}
        </button>
      ))}
    </div>
  );
}

export default function ConnectWallet({ compact = false }: { compact?: boolean }) {
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

  const connectBtnClass = compact
    ? "shrink-0 rounded-full bg-white px-4 py-2 text-xs font-normal text-black transition-colors hover:bg-neutral-200 disabled:opacity-50 md:px-5 md:py-2.5 md:text-sm"
    : "rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200 disabled:opacity-50";

  if (!isConnected) {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    const wcConnector = connectors.find((c) => c.id === "walletConnect");
    return (
      <div className="flex max-w-full items-center justify-end gap-1.5 md:gap-2">
        <ChainPills
          activeId={walletChainId}
          onSelect={selectChain}
          disabled={isSwitching}
          compact={compact}
        />
        {wcConnector && (
          <button
            type="button"
            className="hidden rounded-full border border-white/20 px-3 py-2 text-[11px] text-white/80 hover:text-white sm:inline md:text-xs"
            disabled={isPending}
            onClick={() => connect({ connector: wcConnector })}
          >
            walletconnect
          </button>
        )}
        <button
          type="button"
          className={connectBtnClass}
          disabled={!injectedConnector || isPending}
          onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        >
          {isPending ? "…" : compact ? "connect" : "connect wallet"}
        </button>
      </div>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;
  const onSupported = chainId !== undefined && isSupportedChainId(chainId);

  if (compact) {
    return (
      <div className="flex max-w-full items-center justify-end gap-1.5">
        <ChainPills
          activeId={walletChainId}
          onSelect={selectChain}
          disabled={isSwitching}
          compact
        />
        <span
          className="max-w-[100px] truncate rounded-full bg-black/40 px-3 py-2 font-mono text-[11px] text-white/90 md:max-w-none md:text-xs"
          title={address}
        >
          {short}
        </span>
        <button
          type="button"
          className="rounded-full border border-white/15 px-3 py-2 text-[11px] text-neutral-300 hover:text-white"
          onClick={() => disconnect()}
        >
          out
        </button>
      </div>
    );
  }

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
