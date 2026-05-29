import { SigningRejectedError, useAllow, useConfidentialBalances } from "@zama-fhe/react-sdk";
import { formatUnits } from "viem";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContracts } from "wagmi";
import PageShell from "../components/PageShell";
import StatusMessage from "../components/StatusMessage";
import { useAllRegistryPairs } from "../hooks/useAllRegistryPairs";
import { formatTxError } from "../lib/errors";
import type { RegistryPairItem } from "../lib/pairSearch";

const ERC20_BALANCE_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export default function Portfolio() {
  const { address, chainId, isConnected } = useAccount();
  const { data: allPairs, isLoading: pairsLoading } = useAllRegistryPairs({
    enabled: isConnected,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [decryptReady, setDecryptReady] = useState(false);

  const contracts = useMemo(
    () =>
      (allPairs ?? []).map((pair) => ({
        address: pair.tokenAddress,
        abi: ERC20_BALANCE_ABI,
        functionName: "balanceOf" as const,
        args: address ? ([address] as const) : undefined,
      })),
    [allPairs, address],
  );

  const { data: publicBalances } = useReadContracts({
    contracts,
    query: { enabled: Boolean(address) && contracts.length > 0 },
  });

  const holdings = useMemo(() => {
    if (!allPairs || !publicBalances) return [] as RegistryPairItem[];
    return allPairs.filter((_pair, i) => {
      const result = publicBalances[i];
      if (!result || result.status !== "success") return false;
      return (result.result as bigint) > 0n;
    });
  }, [allPairs, publicBalances]);

  const confidentialAddresses = useMemo(
    () => holdings.map((p) => p.confidentialTokenAddress),
    [holdings],
  );

  const { data: batchBalances, isLoading: balancesLoading } = useConfidentialBalances(
    { tokenAddresses: confidentialAddresses as [`0x${string}`, ...`0x${string}`[]] },
    { enabled: isConnected && decryptReady && confidentialAddresses.length > 0 },
  );

  const allow = useAllow();

  async function authorizeAll() {
    if (confidentialAddresses.length === 0) return;
    setStatus(null);
    try {
      await allow.mutateAsync(
        confidentialAddresses as [`0x${string}`, ...`0x${string}`[]],
      );
      setDecryptReady(true);
      setStatus("signed eip-712 for all listed pairs.");
    } catch (e) {
      if (e instanceof SigningRejectedError) {
        setStatus("wallet rejected authorization.");
      } else {
        setStatus(formatTxError(e));
      }
    }
  }

  return (
    <PageShell
      title="portfolio"
      description="public erc-20 balances across registry pairs, plus decrypted confidential balances after eip-712."
    >
      {!isConnected && (
        <StatusMessage variant="info">connect a wallet to view your holdings.</StatusMessage>
      )}

      {isConnected && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={confidentialAddresses.length === 0 || allow.isPending}
              onClick={authorizeAll}
              className="rounded-full bg-white px-5 py-2.5 text-sm text-black hover:bg-neutral-200 disabled:opacity-40"
            >
              {allow.isPending ? "signing…" : "authorize decrypt (all pairs with balance)"}
            </button>
          </div>

          {pairsLoading && <p className="text-white/50">loading registry…</p>}

          {!pairsLoading && holdings.length === 0 && (
            <StatusMessage variant="info">
              no public balances found on registry underlyings. try the{" "}
              <Link to="/start" className="underline">
                getting started
              </Link>{" "}
              flow or the faucet.
            </StatusMessage>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {holdings.map((pair) => {
              const idx = allPairs?.indexOf(pair) ?? -1;
              const pub =
                idx >= 0 && publicBalances?.[idx]?.status === "success"
                  ? (publicBalances[idx].result as bigint)
                  : 0n;
              const confBal = batchBalances?.results.get(pair.confidentialTokenAddress);
              const allowed = decryptReady;

              return (
                <article key={pair.confidentialTokenAddress} className="pill-surface rounded-2xl p-5">
                  <p className="text-lg font-medium text-white">
                    {pair.underlying.symbol} → {pair.confidential.symbol}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-white/60">public</span>
                      <span className="font-mono">
                        {formatUnits(pub, 18)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-white/60">confidential</span>
                      <span className="font-mono">
                        {!allowed
                          ? "authorize decrypt"
                          : balancesLoading
                            ? "…"
                            : confBal !== undefined
                              ? formatUnits(confBal, 18)
                              : "0"}
                      </span>
                    </li>
                  </ul>
                  <Link
                    to={`/pair/${pair.confidentialTokenAddress}`}
                    state={{ pair }}
                    className="mt-4 inline-block text-sm text-white/70 hover:text-white"
                  >
                    manage pair →
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}

      {status && <StatusMessage variant="info">{status}</StatusMessage>}
    </PageShell>
  );
}
