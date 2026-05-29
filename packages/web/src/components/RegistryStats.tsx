import { useTokenPairsLength } from "@zama-fhe/react-sdk";
import type { RegistryPairItem } from "../lib/pairSearch";

type Props = {
  pairs?: RegistryPairItem[];
  isLoading?: boolean;
};

export default function RegistryStats({ pairs, isLoading }: Props) {
  const { data: onChainTotal } = useTokenPairsLength();
  const loaded = pairs?.length ?? 0;
  const valid = pairs?.filter((p) => p.isValid).length ?? 0;
  const revoked = loaded - valid;
  const totalN = onChainTotal !== undefined ? Number(onChainTotal) : undefined;
  const coverage =
    totalN !== undefined && loaded > 0 ? Math.min(100, Math.round((loaded / totalN) * 100)) : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "on-chain total", value: isLoading ? "…" : (totalN?.toString() ?? "…") },
        { label: "loaded", value: isLoading ? "…" : loaded.toString() },
        { label: "valid", value: isLoading ? "…" : valid.toString() },
        {
          label: "coverage",
          value: coverage !== undefined ? `${coverage}%` : "…",
        },
      ].map((stat) => (
        <div key={stat.label} className="pill-surface rounded-2xl px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-white/50">{stat.label}</p>
          <p className="mt-1 text-xl font-medium text-white">{stat.value}</p>
        </div>
      ))}
      {revoked > 0 && (
        <p className="col-span-full text-xs text-white/45">
          {revoked} revoked pair{revoked === 1 ? "" : "s"} still listed for transparency.
        </p>
      )}
    </div>
  );
}
