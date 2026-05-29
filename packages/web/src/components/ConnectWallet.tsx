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
    <div className="chain-switch" role="group" aria-label="Network">
      <button
        type="button"
        className={activeId === sepolia.id ? "chain-chip is-active" : "chain-chip"}
        disabled={disabled}
        onClick={() => onSelect(sepolia.id)}
      >
        Sepolia
      </button>
      <button
        type="button"
        className={activeId === mainnet.id ? "chain-chip is-active" : "chain-chip"}
        disabled={disabled}
        onClick={() => onSelect(mainnet.id)}
      >
        Mainnet
      </button>
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
      <div className="wallet-bar">
        <ChainPills activeId={walletChainId} onSelect={selectChain} disabled={isSwitching} />
        <button
          type="button"
          className="btn btn--primary"
          disabled={!connector || isPending}
          onClick={() => connector && connect({ connector })}
        >
          {isPending ? "Connecting…" : "Connect wallet"}
        </button>
      </div>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;
  const onSupported = chainId !== undefined && isSupportedChainId(chainId);

  return (
    <div className="wallet-bar">
      <span
        className={`wallet-status${onSupported ? "" : " wallet-status--warn"}`}
        title={onSupported ? "Connected on supported network" : "Unsupported network"}
        aria-hidden
      />
      <span className="wallet-address" title={address}>
        {short}
      </span>
      {!onSupported && (
        <button type="button" className="btn btn--warn btn--sm" onClick={() => switchChain({ chainId: sepolia.id })}>
          Use Sepolia
        </button>
      )}
      <ChainPills activeId={walletChainId} onSelect={selectChain} disabled={isSwitching} />
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
