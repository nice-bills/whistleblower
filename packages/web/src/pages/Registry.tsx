import { useListPairs, useTokenPairsLength, useWrappersRegistryAddress } from "@zama-fhe/react-sdk";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import AddressLink from "../components/AddressLink";
import RevealOnScroll from "../components/RevealOnScroll";
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

  const previewPairs = items.slice(0, 3);

  return (
    <>
      <RevealOnScroll>
      <section className="hero-split" aria-labelledby="hero-title">
        <div className="hero-split__copy">
          <p className="hero-split__tag">Confidential wrappers</p>
          <h1 id="hero-title" className="hero-split__title">
            Every official pair, <em>one</em> calm place.
          </h1>
          <p className="hero-split__lede">
            Browse ERC-20 to ERC-7984 mappings from the Zama registry. Wrap, decrypt balances with
            EIP-712, and unwrap on Sepolia or mainnet.
          </p>
          <div className="hero-split__actions">
            <a href="#registry-panel" className="btn btn--primary btn--glow">
              Browse pairs
            </a>
            <Link to="/faucet" className="btn btn--ghost">
              Sepolia faucet
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden>
          <div className="hero-visual__blob hero-visual__blob--1" />
          <div className="hero-visual__blob hero-visual__blob--2" />
          <div className="hero-visual__cards">
            {(previewPairs.length > 0
              ? previewPairs.map((pair) => {
                  const meta =
                    "underlying" in pair
                      ? (pair as {
                          underlying: { symbol: string };
                          confidential: { symbol: string };
                        })
                      : null;
                  return (
                    <div key={pair.confidentialTokenAddress} className="hero-visual__card">
                      <span className="hero-visual__pair">
                        {meta?.underlying.symbol ?? "ERC-20"}
                        <span className="pair-card__arrow"> → </span>
                        {meta?.confidential.symbol ?? "cToken"}
                      </span>
                      <span className="hero-visual__badge">{pair.isValid ? "Valid" : "Revoked"}</span>
                    </div>
                  );
                })
              : [
                  { u: "USDC", c: "cUSDC" },
                  { u: "DAI", c: "cDAI" },
                  { u: "ETH", c: "cETH" },
                ].map((sample) => (
                  <div key={sample.c} className="hero-visual__card">
                    <span className="hero-visual__pair">
                      {sample.u}
                      <span className="pair-card__arrow"> → </span>
                      {sample.c}
                    </span>
                    <span className="hero-visual__badge">Valid</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={80}>
      <section className="steps-strip" aria-label="How it works">
        <article className="step-card">
          <p className="step-card__num">01</p>
          <h2 className="step-card__title">Pick a pair</h2>
          <p className="step-card__desc">Find your underlying and confidential token in the registry.</p>
        </article>
        <article className="step-card">
          <p className="step-card__num">02</p>
          <h2 className="step-card__title">Wrap & decrypt</h2>
          <p className="step-card__desc">Shield tokens and sign EIP-712 to view your balance.</p>
        </article>
        <article className="step-card">
          <p className="step-card__num">03</p>
          <h2 className="step-card__title">Unwrap anytime</h2>
          <p className="step-card__desc">Move back to public ERC-20 when you are ready.</p>
        </article>
      </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={120}>
      <section id="registry-panel" className="panel" aria-labelledby="registry-heading">
        <div className="panel__head">
          <div>
            <h2 id="registry-heading" className="panel__title">
              All pairs
            </h2>
            <p className="panel__desc">
              {totalPairs !== undefined ? (
                <>
                  <strong>{totalPairs.toString()}</strong> pairs on{" "}
                  {chainLabel(activeChainId).toLowerCase()}
                </>
              ) : (
                "Loading pair count…"
              )}
            </p>
          </div>
        </div>

        <div className="stat-pills">
          <div className="stat-pill">
            <span className="stat-pill__label">Network</span>
            <span className="stat-pill__value">{chainLabel(activeChainId)}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__label">Registry</span>
            <span className="stat-pill__value">
              {registryAddress ? (
                <AddressLink chainId={activeChainId} address={registryAddress} />
              ) : (
                "…"
              )}
            </span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__label">Config</span>
            <span className="stat-pill__value stat-pill__value--mono">
              {REGISTRY_ADDRESSES[activeChainId]}
            </span>
          </div>
        </div>

        <div className="toolbar">
          <label className="search-field">
            <span className="sr-only">Filter pairs</span>
            <input
              type="search"
              placeholder="Search symbol or address…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={validOnly}
              onChange={(e) => {
                setValidOnly(e.target.checked);
                setPage(1);
              }}
            />
            Valid only
          </label>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isLoading && (
          <p className="loading-block">
            <span className="loading-dots">Loading pairs</span>
          </p>
        )}
        {error && <StatusMessage variant="error">{error.message}</StatusMessage>}

        {!isLoading && !error && (
          <>
            <div
              key={`${page}-${validOnly}-${query}`}
              className={`pair-grid${!isLoading ? " pair-grid--animate" : ""}`}
            >
              {items.length === 0 && (
                <p className="empty-state">No pairs match this page or filter.</p>
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
                    className="pair-card"
                  >
                    <div className="pair-card__top">
                      <div>
                        <p className="pair-card__symbols">
                          {meta?.underlying.symbol ?? "ERC-20"}
                          <span className="pair-card__arrow"> → </span>
                          {meta?.confidential.symbol ?? "ERC-7984"}
                        </p>
                        <p className="pair-card__names">
                          {meta?.underlying.name}
                          {meta?.underlying.name && meta?.confidential.name ? " · " : ""}
                          {meta?.confidential.name}
                        </p>
                      </div>
                      <span className={pair.isValid ? "badge badge--valid" : "badge badge--revoked"}>
                        {pair.isValid ? "Valid" : "Revoked"}
                      </span>
                    </div>
                    <div className="pair-card__addrs">
                      <AddressLink chainId={activeChainId} address={pair.tokenAddress} />
                      <AddressLink chainId={activeChainId} address={pair.confidentialTokenAddress} />
                    </div>
                    <div className="pair-card__footer">
                      <Link
                        className="btn btn--primary btn--sm"
                        to={`/pair/${pair.confidentialTokenAddress}`}
                        state={{ pair }}
                      >
                        Open pair
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="pagination">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages} · {data?.total ?? 0} total
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
      </RevealOnScroll>
    </>
  );
}
