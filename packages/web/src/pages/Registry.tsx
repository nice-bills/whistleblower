import { useTokenPairsLength, useWrappersRegistryAddress } from "@zama-fhe/react-sdk";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import AddressLink from "../components/AddressLink";
import ExportPairsButton from "../components/ExportPairsButton";
import NetworkCompare from "../components/NetworkCompare";
import PairCard from "../components/PairCard";
import RecentPairs from "../components/RecentPairs";
import RegistryHero from "../components/RegistryHero";
import RegistryStats from "../components/RegistryStats";
import StatusMessage from "../components/StatusMessage";
import { useActiveChainId } from "../context/ViewChainContext";
import { useAllRegistryPairs } from "../hooks/useAllRegistryPairs";
import { REGISTRY_ADDRESSES, chainLabel } from "../config";
import { filterPairs, sortPairs } from "../lib/pairSearch";
import { loadFavoritePairs } from "../lib/storage";

const PAGE_SIZE = 24;

export default function Registry() {
  const { chainId, isConnected } = useAccount();
  const [page, setPage] = useState(1);
  const [validOnly, setValidOnly] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"symbol" | "valid-first" | "favorites">("symbol");

  const activeChainId = useActiveChainId(chainId, isConnected);
  const registryAddress = useWrappersRegistryAddress();
  const { data: totalPairs } = useTokenPairsLength();
  const {
    data: allPairs,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAllRegistryPairs();

  const favorites = useMemo(() => loadFavoritePairs(), [allPairs]);

  const filtered = useMemo(() => {
    const list = filterPairs(allPairs ?? [], query, validOnly);
    return sortPairs(list, sort, favorites);
  }, [allPairs, query, validOnly, sort, favorites]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <RegistryHero
        pairCount={totalPairs}
        networkLabel={chainLabel(activeChainId).toLowerCase()}
      />

      <section
        id="registry-panel"
        className="relative z-10 scroll-mt-24 bg-black px-5 pb-24 pt-14 md:px-10 md:pt-20"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-8">
            <div>
              <h2 className="text-2xl font-medium lowercase tracking-tight text-white md:text-3xl">
                all pairs
              </h2>
              <p className="mt-1 text-sm text-white/60">
                global search across the full registry · {chainLabel(activeChainId).toLowerCase()}
              </p>
            </div>
            <Link
              to="/start"
              className="rounded-full bg-white px-5 py-2.5 text-sm text-black hover:bg-neutral-200"
            >
              getting started →
            </Link>
          </header>

          <div className="mb-8 space-y-6">
            <NetworkCompare />
            <RegistryStats pairs={allPairs} isLoading={isLoading} />
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <div className="pill-surface rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/50">network</p>
              <p className="mt-1 text-sm text-white">{chainLabel(activeChainId)}</p>
            </div>
            <div className="pill-surface min-w-0 rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/50">registry</p>
              <p className="mt-1">
                {registryAddress ? (
                  <AddressLink chainId={activeChainId} address={registryAddress} />
                ) : (
                  "…"
                )}
              </p>
            </div>
          </div>

          {allPairs && <RecentPairs allPairs={allPairs} />}

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <label className="min-w-[200px] flex-1">
              <span className="sr-only">search entire registry</span>
              <input
                type="search"
                placeholder="search all pairs by symbol or address…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pill-surface w-full max-w-md rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="pill-surface rounded-full px-4 py-2.5 text-sm text-white"
              aria-label="sort pairs"
            >
              <option value="symbol">sort: symbol</option>
              <option value="valid-first">sort: valid first</option>
              <option value="favorites">sort: favorites</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={validOnly}
                onChange={(e) => {
                  setValidOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-white/30"
              />
              valid only
            </label>
            <button
              type="button"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:text-white"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "refreshing…" : "refresh"}
            </button>
            {allPairs && <ExportPairsButton pairs={filtered} />}
          </div>

          {isLoading && <p className="py-12 text-center text-white/50">loading full registry…</p>}
          {error && <StatusMessage variant="error">{error.message}</StatusMessage>}

          {!isLoading && !error && (
            <>
              <p className="mb-4 text-sm text-white/50">
                showing {pageItems.length} of {filtered.length} matches
                {query ? ` for “${query}”` : ""}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.length === 0 && (
                  <p className="col-span-full rounded-2xl border border-dashed border-white/15 py-16 text-center text-white/50">
                    no pairs match this filter
                  </p>
                )}
                {pageItems.map((pair) => (
                  <PairCard key={pair.confidentialTokenAddress} pair={pair} chainId={activeChainId} />
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/60">
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 transition-colors hover:text-white disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  previous
                </button>
                <span>
                  page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 transition-colors hover:text-white disabled:opacity-40"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  next
                </button>
              </div>
            </>
          )}

          <p className="mt-8 font-mono text-xs text-white/30">{REGISTRY_ADDRESSES[activeChainId]}</p>
        </div>
      </section>
    </>
  );
}
