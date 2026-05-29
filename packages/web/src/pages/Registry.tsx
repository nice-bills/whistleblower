import { useListPairs, useTokenPairsLength, useWrappersRegistryAddress } from "@zama-fhe/react-sdk";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import AddressLink from "../components/AddressLink";
import RegistryHero from "../components/RegistryHero";
import StatusMessage from "../components/StatusMessage";
import { useActiveChainId } from "../context/ViewChainContext";
import { REGISTRY_ADDRESSES, chainLabel } from "../config";

const PAGE_SIZE = 50;

export default function Registry() {
  const { chainId, isConnected } = useAccount();
  const [page, setPage] = useState(1);
  const [validOnly, setValidOnly] = useState(true);
  const [query, setQuery] = useState("");

  const activeChainId = useActiveChainId(chainId, isConnected);

  const registryAddress = useWrappersRegistryAddress();
  const { data: totalPairs } = useTokenPairsLength();
  const { data, isLoading, error, refetch, isFetching } = useListPairs({
    page,
    pageSize: PAGE_SIZE,
    metadata: true,
  });

  const items = useMemo(() => {
    let list = data?.items ?? [];
    if (validOnly) list = list.filter((p) => p.isValid);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((pair) => {
      if (!("underlying" in pair)) return false;
      const p = pair as {
        underlying: { symbol: string; name: string };
        confidential: { symbol: string; name: string };
      };
      const hay = [
        p.underlying.symbol,
        p.underlying.name,
        p.confidential.symbol,
        p.confidential.name,
        pair.tokenAddress,
        pair.confidentialTokenAddress,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data?.items, validOnly, query]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

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
                {totalPairs !== undefined
                  ? `${totalPairs.toString()} on ${chainLabel(activeChainId).toLowerCase()}`
                  : "loading…"}
              </p>
            </div>
          </header>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <div className="pill-surface rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/50">network</p>
              <p className="mt-1 text-sm text-white">{chainLabel(activeChainId)}</p>
            </div>
            <div className="pill-surface min-w-0 rounded-2xl px-4 py-3 sm:col-span-1">
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

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <label className="min-w-[200px] flex-1">
              <span className="sr-only">filter pairs</span>
              <input
                type="search"
                placeholder="search symbol or address…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pill-surface w-full max-w-md rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>
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
          </div>

          {isLoading && <p className="py-12 text-center text-white/50">loading pairs…</p>}
          {error && <StatusMessage variant="error">{error.message}</StatusMessage>}

          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.length === 0 && (
                  <p className="col-span-full rounded-2xl border border-dashed border-white/15 py-16 text-center text-white/50">
                    no pairs match this filter
                  </p>
                )}
                {items.map((pair) => {
                  const meta =
                    "underlying" in pair
                      ? (pair as {
                          underlying: { symbol: string; name: string };
                          confidential: { symbol: string; name: string };
                        })
                      : null;
                  return (
                    <article
                      key={`${pair.tokenAddress}-${pair.confidentialTokenAddress}`}
                      className="pill-surface flex flex-col gap-4 rounded-2xl p-5 transition-colors hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-lg font-medium lowercase text-white">
                            {meta?.underlying.symbol ?? "erc-20"}
                            <span className="text-white/50"> → </span>
                            {meta?.confidential.symbol ?? "erc-7984"}
                          </p>
                          <p className="mt-1 text-xs text-white/50">
                            {meta?.underlying.name}
                            {meta?.underlying.name && meta?.confidential.name ? " · " : ""}
                            {meta?.confidential.name}
                          </p>
                        </div>
                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            pair.isValid
                              ? "bg-white/15 text-white"
                              : "bg-white/5 text-white/50 line-through",
                          ].join(" ")}
                        >
                          {pair.isValid ? "valid" : "revoked"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <AddressLink chainId={activeChainId} address={pair.tokenAddress} />
                        <AddressLink chainId={activeChainId} address={pair.confidentialTokenAddress} />
                      </div>
                      <Link
                        to={`/pair/${pair.confidentialTokenAddress}`}
                        state={{ pair }}
                        className="mt-auto rounded-full bg-white py-2.5 text-center text-sm text-black transition-colors hover:bg-neutral-200"
                      >
                        open pair
                      </Link>
                    </article>
                  );
                })}
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
                  page {page} of {totalPages} · {data?.total ?? 0} total
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
