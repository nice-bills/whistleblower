import {
  SigningRejectedError,
  useAllow,
  useConfidentialBalance,
  useIsAllowed,
  useMetadata,
  useShield,
  useTokenAddress,
  useUnshield,
  useUnshieldAll,
} from "@zama-fhe/react-sdk";
import { parseUnits, formatUnits } from "viem";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import AddressLink from "../components/AddressLink";
import PageShell from "../components/PageShell";
import StatusMessage from "../components/StatusMessage";
import TxLink from "../components/TxLink";
import { useActiveChainId } from "../context/ViewChainContext";
import type { TokenWrapperPair } from "@zama-fhe/react-sdk";

type StatusState =
  | { variant: "success" | "info" | "error"; message: string; txHash?: string }
  | null;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";

const cardClass =
  "flex flex-col gap-4 rounded-2xl border border-white/10 bg-neutral-900/90 p-5 backdrop-blur";

const btnPrimary =
  "rounded-full bg-white py-2.5 text-sm text-black transition-colors hover:bg-neutral-200 disabled:opacity-40";

export default function PairDetail() {
  const { confidentialAddress } = useParams<{ confidentialAddress: string }>();
  const confidential = (confidentialAddress ?? "") as `0x${string}`;

  if (confidential.length !== 42 || !confidential.startsWith("0x")) {
    return (
      <PageShell title="invalid pair">
        <StatusMessage variant="error">invalid confidential token address in url.</StatusMessage>
      </PageShell>
    );
  }

  return <PairDetailContent confidential={confidential} />;
}

function PairDetailContent({ confidential }: { confidential: `0x${string}` }) {
  const location = useLocation();
  const pairFromNav = (location.state as { pair?: TokenWrapperPair } | null)?.pair;

  const { address, chainId, isConnected } = useAccount();
  const activeChainId = useActiveChainId(chainId, isConnected);

  const { data: underlyingLookup } = useTokenAddress({
    confidentialTokenAddress: confidential,
  });
  const [isValid, underlyingFromRegistry] = underlyingLookup ?? [false, "0x"];
  const underlying = (pairFromNav?.tokenAddress ?? underlyingFromRegistry) as `0x${string}`;

  const { data: underlyingMeta } = useMetadata(underlying);
  const { data: confidentialMeta } = useMetadata(confidential);

  const decimals = underlyingMeta?.decimals ?? 18;
  const [wrapAmount, setWrapAmount] = useState("100");
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const [status, setStatus] = useState<StatusState>(null);

  const { data: isAllowed } = useIsAllowed({ contractAddresses: [confidential] });
  const allow = useAllow();
  const { data: confidentialBalance, isLoading: balanceLoading, refetch: refetchBalance } =
    useConfidentialBalance({ tokenAddress: confidential }, { enabled: isConnected && Boolean(isAllowed) });

  const { data: publicBalance } = useReadContract({
    address: underlying,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && underlying.length === 42 },
  });

  const shield = useShield({
    tokenAddress: confidential,
    wrapperAddress: confidential,
    optimistic: true,
  });
  const unshield = useUnshield({
    tokenAddress: confidential,
    wrapperAddress: confidential,
  });
  const unshieldAll = useUnshieldAll({
    tokenAddress: confidential,
    wrapperAddress: confidential,
  });

  const valid = pairFromNav?.isValid ?? isValid;

  async function handleAuthorizeDecrypt() {
    setStatus(null);
    try {
      await allow.mutateAsync([confidential]);
      setStatus({ variant: "success", message: "eip-712 signed. fetching balance…" });
      await refetchBalance();
    } catch (e) {
      if (e instanceof SigningRejectedError) {
        setStatus({ variant: "error", message: "wallet rejected the eip-712 authorization." });
      } else {
        setStatus({ variant: "error", message: e instanceof Error ? e.message : "authorization failed." });
      }
    }
  }

  async function handleWrap() {
    setStatus(null);
    try {
      const amount = parseUnits(wrapAmount || "0", decimals);
      const result = await shield.mutateAsync({ amount });
      setStatus({
        variant: "success",
        message: "wrapped successfully.",
        txHash: result.txHash,
      });
      await refetchBalance();
    } catch (e) {
      setStatus({ variant: "error", message: e instanceof Error ? e.message : "wrap failed." });
    }
  }

  async function handleUnwrap() {
    setStatus(null);
    try {
      const result =
        unwrapAmount.trim() === ""
          ? await unshieldAll.mutateAsync()
          : await unshield.mutateAsync({ amount: parseUnits(unwrapAmount, decimals) });
      setStatus({
        variant: "success",
        message: "unwrap submitted.",
        txHash: result.txHash,
      });
      await refetchBalance();
    } catch (e) {
      setStatus({ variant: "error", message: e instanceof Error ? e.message : "unwrap failed." });
    }
  }

  const publicBalDisplay =
    publicBalance !== undefined ? formatUnits(publicBalance as bigint, decimals) : "…";

  const confidentialBalDisplay = !isAllowed
    ? "sign to decrypt"
    : balanceLoading
      ? "…"
      : confidentialBalance !== undefined
        ? formatUnits(confidentialBalance, decimals)
        : "…";

  const title = `${underlyingMeta?.symbol ?? "…"} → ${confidentialMeta?.symbol ?? "…"}`;

  return (
    <PageShell
      title={title.toLowerCase()}
      description="shield public erc-20 into confidential erc-7984, authorize decryption, or unshield back."
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <span
          className={[
            "rounded-full px-3 py-1 text-xs",
            valid ? "bg-white/15 text-white" : "bg-white/5 text-white/50",
          ].join(" ")}
        >
          {valid ? "valid" : "revoked"}
        </span>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-2 text-xs backdrop-blur">
          underlying <AddressLink chainId={activeChainId} address={underlying} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-2 text-xs backdrop-blur">
          confidential <AddressLink chainId={activeChainId} address={confidential} />
        </div>
      </div>

      {!isConnected && (
        <StatusMessage variant="info">connect a wallet on sepolia or mainnet to use this pair.</StatusMessage>
      )}

      {isConnected && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className={cardClass}>
            <h2 className="text-lg font-medium lowercase text-white">balances</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">public {underlyingMeta?.symbol}</span>
                <span className="font-mono text-white">{publicBalDisplay}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-white/60">confidential {confidentialMeta?.symbol}</span>
                <span className="font-mono text-white">{confidentialBalDisplay}</span>
              </li>
            </ul>
            <button
              type="button"
              className={btnPrimary}
              onClick={handleAuthorizeDecrypt}
              disabled={allow.isPending}
            >
              {allow.isPending
                ? "signing eip-712…"
                : isAllowed
                  ? "re-authorize decrypt"
                  : "authorize decrypt"}
            </button>
          </article>

          <article className={cardClass}>
            <h2 className="text-lg font-medium lowercase text-white">wrap</h2>
            <label className="text-xs text-white/60" htmlFor="wrap-amount">
              amount ({underlyingMeta?.symbol ?? "tokens"})
            </label>
            <input
              id="wrap-amount"
              className={inputClass}
              type="text"
              inputMode="decimal"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              placeholder="100"
            />
            <button
              type="button"
              className={btnPrimary}
              onClick={handleWrap}
              disabled={!valid || shield.isPending}
            >
              {shield.isPending ? "wrapping…" : "wrap to confidential"}
            </button>
          </article>

          <article className={cardClass}>
            <h2 className="text-lg font-medium lowercase text-white">unwrap</h2>
            <label className="text-xs text-white/60" htmlFor="unwrap-amount">
              amount
            </label>
            <input
              id="unwrap-amount"
              className={inputClass}
              type="text"
              inputMode="decimal"
              value={unwrapAmount}
              onChange={(e) => setUnwrapAmount(e.target.value)}
              placeholder="empty = full balance"
            />
            <p className="text-xs text-white/40">leave blank to unshield everything.</p>
            <button
              type="button"
              className={btnPrimary}
              onClick={handleUnwrap}
              disabled={!valid || unshield.isPending || unshieldAll.isPending}
            >
              {unshield.isPending || unshieldAll.isPending ? "unshielding…" : "unwrap to erc-20"}
            </button>
          </article>
        </div>
      )}

      {status && (
        <StatusMessage variant={status.variant}>
          {status.message}
          {status.txHash && (
            <>
              {" "}
              <TxLink chainId={activeChainId} hash={status.txHash} />
            </>
          )}
        </StatusMessage>
      )}

      <Link
        to="/"
        className="mt-10 inline-block text-sm text-white/60 transition-colors hover:text-white"
      >
        ← back to registry
      </Link>
    </PageShell>
  );
}
