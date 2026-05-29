import { useListPairs, useTokenPairsLength, useWrappersRegistryAddress } from "@zama-fhe/react-sdk";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import AddressLink from "../components/AddressLink";
import ConnectWallet from "../components/ConnectWallet";
import { REGISTRY_ADDRESSES, isSupportedChainId } from "../config";

const PAGE_SIZE = 50;

export default function Registry() {
  const { chainId } = useAccount();
  const [page, setPage] = useState(1);
  const [validOnly, setValidOnly] = useState(true);

  const activeChainId = chainId && isSupportedChainId(chainId) ? chainId : 11155111;

  const registryAddress = useWrappersRegistryAddress();
  const { data: totalPairs } = useTokenPairsLength();
  const { data, isLoading, error, refetch, isFetching } = useListPairs({
    page,
    pageSize: PAGE_SIZE,
    metadata: true,
  });

  const items = useMemo(() => {
    const list = data?.items ?? [];
    if (!validOnly) return list;
    return list.filter((p) => p.isValid);
  }, [data?.items, validOnly]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Wrapper registry</h2>
          <p className="muted">
            Official ERC-20 ↔ ERC-7984 pairs on Sepolia and Ethereum mainnet.{" "}
            {totalPairs !== undefined && (
              <span>
                <strong>{totalPairs.toString()}</strong> pairs on-chain.
              </span>
            )}
          </p>
        </div>
        <ConnectWallet />
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="label">Network</span>
          <span>{activeChainId === 1 ? "Ethereum mainnet" : "Sepolia"}</span>
        </div>
        <div className="info-card">
          <span className="label">Registry contract</span>
          {registryAddress ? (
            <AddressLink chainId={activeChainId} address={registryAddress} />
          ) : (
            <span className="muted">…</span>
          )}
        </div>
        <div className="info-card">
          <span className="label">Known registry</span>
          <span className="mono small">{REGISTRY_ADDRESSES[activeChainId]}</span>
        </div>
      </div>

      <div className="toolbar">
        <label className="checkbox">
          <input type="checkbox" checked={validOnly} onChange={(e) => setValidOnly(e.target.checked)} />
          Valid pairs only
        </label>
        <button type="button" className="btn ghost" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {isLoading && <p className="status">Loading registry pairs…</p>}
      {error && <p className="status error">{error.message}</p>}

      {!isLoading && !error && (
        <>
          <div className="table-wrap">
            <table className="registry-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Underlying (ERC-20)</th>
                  <th>Confidential (ERC-7984)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      No pairs on this page.
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
                        <span className={pair.isValid ? "badge ok" : "badge revoked"}>
                          {pair.isValid ? "Valid" : "Revoked"}
                        </span>
                      </td>
                      <td>
                        <div className="token-cell">
                          <strong>{meta?.underlying.symbol ?? "ERC-20"}</strong>
                          <span className="muted small">{meta?.underlying.name}</span>
                          <AddressLink chainId={activeChainId} address={pair.tokenAddress} />
                        </div>
                      </td>
                      <td>
                        <div className="token-cell">
                          <strong>{meta?.confidential.symbol ?? "ERC-7984"}</strong>
                          <span className="muted small">{meta?.confidential.name}</span>
                          <AddressLink chainId={activeChainId} address={pair.confidentialTokenAddress} />
                        </div>
                      </td>
                      <td>
                        <Link
                          className="btn small primary"
                          to={`/pair/${pair.confidentialTokenAddress}`}
                          state={{ pair }}
                        >
                          Wrap / decrypt
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
              className="btn ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="muted">
              Page {page} of {totalPages} ({data?.total ?? 0} total)
            </span>
            <button
              type="button"
              className="btn ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
