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
import StatusMessage from "../components/StatusMessage";
import TxLink from "../components/TxLink";
import { isSupportedChainId } from "../config";
import type { TokenWrapperPair } from "@zama-fhe/react-sdk";

type StatusState =
  | { variant: "success" | "info" | "error"; message: string; txHash?: string }
  | null;

export default function PairDetail() {
  const { confidentialAddress } = useParams<{ confidentialAddress: string }>();
  const confidential = (confidentialAddress ?? "") as `0x${string}`;

  if (confidential.length !== 42 || !confidential.startsWith("0x")) {
    return (
      <StatusMessage variant="error">Invalid confidential token address in URL.</StatusMessage>
    );
  }

  return <PairDetailContent confidential={confidential} />;
}

function PairDetailContent({ confidential }: { confidential: `0x${string}` }) {
  const location = useLocation();
  const pairFromNav = (location.state as { pair?: TokenWrapperPair } | null)?.pair;

  const { address, chainId, isConnected } = useAccount();
  const activeChainId = chainId && isSupportedChainId(chainId) ? chainId : 11155111;

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
      setStatus({ variant: "success", message: "EIP-712 authorization signed. Fetching balance…" });
      await refetchBalance();
    } catch (e) {
      if (e instanceof SigningRejectedError) {
        setStatus({ variant: "error", message: "Wallet rejected the EIP-712 authorization." });
      } else {
        setStatus({ variant: "error", message: e instanceof Error ? e.message : "Authorization failed." });
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
        message: "Wrapped successfully.",
        txHash: result.txHash,
      });
      await refetchBalance();
    } catch (e) {
      setStatus({ variant: "error", message: e instanceof Error ? e.message : "Wrap failed." });
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
        message: "Unwrap submitted.",
        txHash: result.txHash,
      });
      await refetchBalance();
    } catch (e) {
      setStatus({ variant: "error", message: e instanceof Error ? e.message : "Unwrap failed." });
    }
  }

  return (
    <>
      <Link to="/" className="page-back">
        ← Registry
      </Link>

      <header className="page-hero" style={{ paddingTop: 0 }}>
        <p className="page-hero__eyebrow">{valid ? "Valid pair" : "Revoked — do not wrap"}</p>
        <h1 className="pair-heading">
          {underlyingMeta?.symbol ?? "…"}
          <span className="pair-heading__arrow"> → </span>
          {confidentialMeta?.symbol ?? "…"}
        </h1>
        <p className="page-hero__lede">
          Shield public ERC-20 into confidential ERC-7984, authorize decryption, or unshield back to
          the underlying token.
        </p>
      </header>

      <div className="stat-row">
        <div className="stat-cell">
          <span className="stat-cell__label">Status</span>
          <span className="stat-cell__value">
            <span className={valid ? "badge badge--valid" : "badge badge--revoked"}>
              {valid ? "Valid" : "Revoked"}
            </span>
          </span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__label">Underlying ERC-20</span>
          <span className="stat-cell__value">
            <AddressLink chainId={activeChainId} address={underlying} />
          </span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell__label">Confidential wrapper</span>
          <span className="stat-cell__value">
            <AddressLink chainId={activeChainId} address={confidential} />
          </span>
        </div>
      </div>

      {!isConnected && (
        <StatusMessage variant="info">Connect a wallet on Sepolia or mainnet to use this pair.</StatusMessage>
      )}

      {isConnected && (
        <div className="flow-grid">
          <article className="flow-card">
            <p className="flow-card__step">Step 1</p>
            <h2 className="flow-card__title">Balances</h2>
            <ul className="balance-list">
              <li>
                <span className="balance-list__label">Public {underlyingMeta?.symbol}</span>
                <span className="balance-list__value">
                  {publicBalance !== undefined ? formatUnits(publicBalance as bigint, decimals) : "—"}
                </span>
              </li>
              <li>
                <span className="balance-list__label">Confidential {confidentialMeta?.symbol}</span>
                <span className="balance-list__value">
                  {!isAllowed
                    ? "Sign to decrypt"
                    : balanceLoading
                      ? "…"
                      : confidentialBalance !== undefined
                        ? formatUnits(confidentialBalance, decimals)
                        : "—"}
                </span>
              </li>
            </ul>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAuthorizeDecrypt}
              disabled={allow.isPending}
            >
              {allow.isPending
                ? "Signing EIP-712…"
                : isAllowed
                  ? "Re-authorize decrypt"
                  : "Authorize decrypt"}
            </button>
          </article>

          <article className="flow-card">
            <p className="flow-card__step">Step 2</p>
            <h2 className="flow-card__title">Wrap (shield)</h2>
            <label className="field-label" htmlFor="wrap-amount">
              Amount · {underlyingMeta?.symbol ?? "tokens"}
            </label>
            <input
              id="wrap-amount"
              className="field-input"
              type="text"
              inputMode="decimal"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              placeholder="100"
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleWrap}
              disabled={!valid || shield.isPending}
            >
              {shield.isPending ? "Wrapping…" : "Wrap to confidential"}
            </button>
          </article>

          <article className="flow-card">
            <p className="flow-card__step">Step 3</p>
            <h2 className="flow-card__title">Unwrap (unshield)</h2>
            <label className="field-label" htmlFor="unwrap-amount">
              Amount
            </label>
            <input
              id="unwrap-amount"
              className="field-input"
              type="text"
              inputMode="decimal"
              value={unwrapAmount}
              onChange={(e) => setUnwrapAmount(e.target.value)}
              placeholder="Leave empty for full balance"
            />
            <p className="field-hint">SDK runs unwrap request and finalize in one flow.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleUnwrap}
              disabled={!valid || unshield.isPending || unshieldAll.isPending}
            >
              {unshield.isPending || unshieldAll.isPending ? "Unshielding…" : "Unwrap to ERC-20"}
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
    </>
  );
}
