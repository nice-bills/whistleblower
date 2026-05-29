import { useListPairs, useTokenPairsLength, useWrappersRegistryAddress } from "@zama-fhe/react-sdk";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import AddressLink from "../components/AddressLink";
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
      <header className="page-hero">
        <p className="page-hero__eyebrow">On-chain directory</p>
        <h1 className="page-hero__title">Every official confidential wrapper pair.</h1>
        <p className="page-hero__lede">
          Browse ERC-20 ↔ ERC-7984 mappings from the Zama registry. Wrap, decrypt balances with
          EIP-712, and unwrap on Sepolia or mainnet.
        </p>
      </header>

      <section className="panel" aria-labelledby="registry-heading">
        <div className="panel__head">
          <div>
            <h2 id="registry-heading" className="panel__title">
              Registry
            </h2>
            <p className="panel__desc">
              {totalPairs !== undefined ? (
                <>
                  <strong>{totalPairs.toString()}</strong> pairs indexed on{" "}
                  {chainLabel(activeChainId).toLowerCase()}.
                </>
              ) : (
                "Loading pair count…"
              )}
            </p>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-cell">
            <span className="stat-cell__label">Network</span>
            <span className="stat-cell__value">{chainLabel(activeChainId)}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-cell__label">Registry</span>
            <span className="stat-cell__value">
              {registryAddress ? (
                <AddressLink chainId={activeChainId} address={registryAddress} />
              ) : (
                "…"
              )}
            </span>
          </div>
          <div className="stat-cell">
            <span className="stat-cell__label">Config address</span>
            <span className="stat-cell__value stat-cell__value--mono">{REGISTRY_ADDRESSES[activeChainId]}</span>
          </div>
        </div>

        <div className="toolbar">
          <label className="search-field">
            <span className="sr-only">Filter pairs</span>
            <input
              type="search"
              placeholder="Filter by symbol or address…"
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

        {isLoading && <p className="loading-block">Loading pairs</p>}
        {error && <StatusMessage variant="error">{error.message}</StatusMessage>}

        {!isLoading && !error && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Status</th>
                    <th scope="col">Underlying</th>
                    <th scope="col">Confidential</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <p className="empty-state">No pairs match this page or filter.</p>
                      </td>
                    </tr>
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
                      <tr key={`${pair.tokenAddress}-${pair.confidentialTokenAddress}`}>
                        <td>
                          <span className={pair.isValid ? "badge badge--valid" : "badge badge--revoked"}>
                            {pair.isValid ? "Valid" : "Revoked"}
                          </span>
                        </td>
                        <td>
                          <div className="token-stack">
                            <span className="token-stack__symbol">{meta?.underlying.symbol ?? "ERC-20"}</span>
                            <span className="token-stack__name">{meta?.underlying.name}</span>
                            <AddressLink chainId={activeChainId} address={pair.tokenAddress} />
                          </div>
                        </td>
                        <td>
                          <div className="token-stack">
                            <span className="token-stack__symbol">
                              {meta?.confidential.symbol ?? "ERC-7984"}
                            </span>
                            <span className="token-stack__name">{meta?.confidential.name}</span>
                            <AddressLink chainId={activeChainId} address={pair.confidentialTokenAddress} />
                          </div>
                        </td>
                        <td>
                          <Link
                            className="btn btn--primary btn--sm"
                            to={`/pair/${pair.confidentialTokenAddress}`}
                            state={{ pair }}
                          >
                            Open pair
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
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
                Next →
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
