import { useMemo } from "react";
import { Link } from "react-router-dom";
import { loadRecentPairs } from "../lib/storage";
import type { RegistryPairItem } from "../lib/pairSearch";

export default function RecentPairs({ allPairs }: { allPairs: RegistryPairItem[] }) {
  const recent = useMemo(() => {
    const addresses = loadRecentPairs();
    const byAddr = new Map(
      allPairs.map((p) => [p.confidentialTokenAddress.toLowerCase(), p]),
    );
    return addresses
      .map((a) => byAddr.get(a.toLowerCase()))
      .filter((p): p is RegistryPairItem => Boolean(p));
  }, [allPairs]);

  if (recent.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="mb-3 text-sm text-white/60">recent pairs</h3>
      <div className="flex flex-wrap gap-2">
        {recent.map((pair) => (
          <Link
            key={pair.confidentialTokenAddress}
            to={`/pair/${pair.confidentialTokenAddress}`}
            state={{ pair }}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:text-white"
          >
            {pair.underlying.symbol} → {pair.confidential.symbol}
          </Link>
        ))}
      </div>
    </section>
  );
}
