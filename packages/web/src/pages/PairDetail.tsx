import {
  SigningRejectedError,
  useAllow,
  useApproveUnderlying,
  useConfidentialBalance,
  useIsAllowed,
  useMetadata,
  useShield,
  useTokenAddress,
  useUnderlyingAllowance,
  useUnshield,
  useUnshieldAll,
} from "@zama-fhe/react-sdk";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { mainnet } from "wagmi/chains";
import AddressLink from "../components/AddressLink";
import AmountInput from "../components/AmountInput";
import ConfirmDialog from "../components/ConfirmDialog";
import DevPanel from "../components/DevPanel";
import FavoriteButton from "../components/FavoriteButton";
import PageShell from "../components/PageShell";
import StatusMessage from "../components/StatusMessage";
import TxActivityList from "../components/TxActivityList";
import TxLink from "../components/TxLink";
import UnshieldPending from "../components/UnshieldPending";
import { useActiveChainId } from "../context/ViewChainContext";
import { formatTxError } from "../lib/errors";
import { pushRecentPair, pushTxActivity } from "../lib/storage";
import type { TokenWrapperPair } from "@zama-fhe/react-sdk";

type StatusState =
  | { variant: "success" | "info" | "error"; message: string; txHash?: string }
  | null;

const cardClass = "pill-surface flex flex-col gap-4 rounded-2xl p-5";
const btnPrimary =
  "rounded-full bg-white py-2.5 text-sm text-black transition-colors hover:bg-neutral-200 disabled:opacity-40";

const zamaConfig = (confidential: `0x${string}`) => ({
  tokenAddress: confidential,
  wrapperAddress: confidential,
});

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
  const isMainnet = activeChainId === mainnet.id;

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
  const [mainnetAction, setMainnetAction] = useState<"wrap" | "unwrap" | null>(null);

  useEffect(() => {
    pushRecentPair(confidential);
  }, [confidential]);

  const { data: isAllowed } = useIsAllowed({ contractAddresses: [confidential] });
  const allow = useAllow();
  const { data: confidentialBalance, isLoading: balanceLoading, refetch: refetchBalance } =
    useConfidentialBalance({ tokenAddress: confidential }, { enabled: isConnected && Boolean(isAllowed) });

  const { data: publicBalance, refetch: refetchPublic } = useReadContract({
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

  const { data: allowance, refetch: refetchAllowance } = useUnderlyingAllowance(
    zamaConfig(confidential),
    { enabled: isConnected },
  );

  const approve = useApproveUnderlying(zamaConfig(confidential));
  const shield = useShield({ ...zamaConfig(confidential), optimistic: true });
  const unshield = useUnshield(zamaConfig(confidential));
  const unshieldAll = useUnshieldAll(zamaConfig(confidential));

  const valid = pairFromNav?.isValid ?? isValid;
  const needsApproval =
    allowance !== undefined &&
    wrapAmount.trim() !== "" &&
    allowance < parseUnits(wrapAmount || "0", decimals);

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

  function recordTx(hash: string, label: string) {
    pushTxActivity({ chainId: activeChainId, hash, label, at: Date.now() });
  }

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
        setStatus({ variant: "error", message: formatTxError(e) });
      }
    }
  }

  async function handleApprove() {
    setStatus(null);
    try {
      const result = await approve.mutateAsync({});
      recordTx(result.txHash, "approve underlying");
      setStatus({ variant: "success", message: "approval confirmed.", txHash: result.txHash });
      await refetchAllowance();
    } catch (e) {
      setStatus({ variant: "error", message: formatTxError(e) });
    }
  }

  async function runWrap() {
    setStatus(null);
    try {
      const amount = parseUnits(wrapAmount || "0", decimals);
      const result = await shield.mutateAsync({ amount });
      recordTx(result.txHash, "wrap");
      setStatus({
        variant: "success",
        message: "wrapped successfully.",
        txHash: result.txHash,
      });
      await refetchBalance();
      await refetchPublic();
      await refetchAllowance();
    } catch (e) {
      setStatus({ variant: "error", message: formatTxError(e) });
    }
  }

  function handleWrap() {
    if (isMainnet) {
      setMainnetAction("wrap");
      return;
    }
    void runWrap();
  }

  async function runUnwrap() {
    setStatus(null);
    try {
      const result =
        unwrapAmount.trim() === ""
          ? await unshieldAll.mutateAsync()
          : await unshield.mutateAsync({ amount: parseUnits(unwrapAmount, decimals) });
      recordTx(result.txHash, "unwrap");
      setStatus({
        variant: "success",
        message: "unwrap submitted.",
        txHash: result.txHash,
      });
      await refetchBalance();
      await refetchPublic();
    } catch (e) {
      setStatus({ variant: "error", message: formatTxError(e) });
    }
  }

  function handleUnwrap() {
    if (isMainnet) {
      setMainnetAction("unwrap");
      return;
    }
    void runUnwrap();
  }

  async function addTokenToWallet() {
    if (!underlyingMeta || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: underlying,
            symbol: underlyingMeta.symbol,
            decimals: underlyingMeta.decimals,
          },
        },
      });
    } catch {
      /* user dismissed */
    }
  }

  return (
    <PageShell
      title={title.toLowerCase()}
      description="shield public erc-20 into confidential erc-7984, authorize decryption, or unshield back."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <FavoriteButton confidentialAddress={confidential} />
        <span
          className={[
            "rounded-full px-3 py-1 text-xs",
            valid ? "bg-white/15 text-white" : "bg-white/5 text-white/50",
          ].join(" ")}
        >
          {valid ? "valid" : "revoked"}
        </span>
        <div className="pill-surface rounded-2xl px-4 py-2 text-xs">
          underlying <AddressLink chainId={activeChainId} address={underlying} />
        </div>
        <div className="pill-surface rounded-2xl px-4 py-2 text-xs">
          confidential <AddressLink chainId={activeChainId} address={confidential} />
        </div>
        {underlyingMeta && (
          <button
            type="button"
            onClick={addTokenToWallet}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white"
          >
            add erc-20 to wallet
          </button>
        )}
      </div>

      {!valid && (
        <StatusMessage variant="warn">
          this pair is revoked in the registry. wrap and unwrap are disabled; you can still inspect
          addresses.
        </StatusMessage>
      )}

      {isMainnet && (
        <StatusMessage variant="warn">
          you are on ethereum mainnet — transactions use real assets.
        </StatusMessage>
      )}

      <UnshieldPending confidential={confidential} chainId={activeChainId} />

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
              <li className="flex justify-between text-xs text-white/45">
                <span>allowance to wrapper</span>
                <span className="font-mono">
                  {allowance !== undefined
                    ? allowance >= maxUint256 / 2n
                      ? "unlimited"
                      : formatUnits(allowance, decimals)
                    : "…"}
                </span>
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
            <AmountInput
              id="wrap-amount"
              label="amount"
              symbol={underlyingMeta?.symbol}
              value={wrapAmount}
              onChange={setWrapAmount}
              placeholder="100"
              onMax={() => {
                if (publicBalance !== undefined) {
                  setWrapAmount(formatUnits(publicBalance as bigint, decimals));
                }
              }}
            />
            {needsApproval && (
              <button
                type="button"
                className="rounded-full border border-white/25 px-4 py-2 text-sm text-white hover:bg-white/10"
                onClick={handleApprove}
                disabled={approve.isPending}
              >
                {approve.isPending ? "approving…" : "approve erc-20 for wrapper"}
              </button>
            )}
            <button
              type="button"
              className={btnPrimary}
              onClick={handleWrap}
              disabled={!valid || shield.isPending || needsApproval}
            >
              {shield.isPending ? "wrapping…" : "wrap to confidential"}
            </button>
          </article>

          <article className={cardClass}>
            <h2 className="text-lg font-medium lowercase text-white">unwrap</h2>
            <AmountInput
              id="unwrap-amount"
              label="amount"
              value={unwrapAmount}
              onChange={setUnwrapAmount}
              placeholder="empty = full balance"
              hint="leave blank to unshield everything. unshield is two on-chain steps; resume if interrupted."
              onMax={() => {
                if (confidentialBalance !== undefined && isAllowed) {
                  setUnwrapAmount(formatUnits(confidentialBalance, decimals));
                }
              }}
            />
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

      <div className="mt-8 space-y-4">
        <DevPanel confidential={confidential} underlying={underlying} chainId={activeChainId} />
        <TxActivityList chainId={activeChainId} />
      </div>

      <Link
        to="/"
        className="mt-10 inline-block text-sm text-white/60 transition-colors hover:text-white"
      >
        ← back to registry
      </Link>

      <ConfirmDialog
        open={mainnetAction !== null}
        title="confirm mainnet transaction"
        confirmLabel={mainnetAction === "wrap" ? "wrap on mainnet" : "unwrap on mainnet"}
        onCancel={() => setMainnetAction(null)}
        onConfirm={() => {
          const action = mainnetAction;
          setMainnetAction(null);
          if (action === "wrap") void runWrap();
          else void runUnwrap();
        }}
      >
        you are about to move real tokens on ethereum mainnet. double-check the pair, amount, and
        wallet address before continuing.
      </ConfirmDialog>
    </PageShell>
  );
}
