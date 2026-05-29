import { useDualNetworkStats } from "../hooks/useDualNetworkStats";
import { useViewChain } from "../context/ViewChainContext";
import type { SupportedChainId } from "../config";

export default function NetworkCompare() {
  const { data, isLoading } = useDualNetworkStats();
  const { viewChainId, setViewChainId } = useViewChain();

  function select(id: SupportedChainId) {
    setViewChainId(id);
  }

  return (
    <div className="pill-surface grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
      <p className="col-span-full text-xs uppercase tracking-wide text-white/50">
        cross-network coverage
      </p>
      <button
        type="button"
        onClick={() => select(11155111)}
        className={[
          "rounded-xl border px-4 py-3 text-left transition-colors",
          viewChainId === 11155111 ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/20",
        ].join(" ")}
      >
        <p className="text-sm font-medium text-white">sepolia</p>
        <p className="mt-1 text-2xl font-medium text-white">
          {isLoading ? "…" : (data?.sepolia?.toString() ?? "—")}
        </p>
        <p className="mt-1 text-xs text-white/50">registry pairs</p>
      </button>
      <button
        type="button"
        onClick={() => select(1)}
        className={[
          "rounded-xl border px-4 py-3 text-left transition-colors",
          viewChainId === 1 ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/20",
        ].join(" ")}
      >
        <p className="text-sm font-medium text-white">mainnet</p>
        <p className="mt-1 text-2xl font-medium text-white">
          {isLoading ? "…" : (data?.mainnet?.toString() ?? "—")}
        </p>
        <p className="mt-1 text-xs text-white/50">registry pairs</p>
      </button>
      <p className="col-span-full text-xs text-white/40">
        click a network to browse its registry (read-only when wallet is disconnected).
      </p>
    </div>
  );
}
