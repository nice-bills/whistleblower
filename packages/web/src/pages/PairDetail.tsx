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
import ConnectWallet from "../components/ConnectWallet";
import { isSupportedChainId } from "../config";
import type { TokenWrapperPair } from "@zama-fhe/react-sdk";

export default function PairDetail() {
  const { confidentialAddress } = useParams<{ confidentialAddress: string }>();
  const confidential = (confidentialAddress ?? "") as `0x${string}`;

  if (confidential.length !== 42 || !confidential.startsWith("0x")) {
    return <p className="status error">Invalid confidential token address.</p>;
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
  const [status, setStatus] = useState<string | null>(null);

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
      setStatus("Decryption authorized (EIP-712). Fetching balance…");
      await refetchBalance();
    } catch (e) {
      if (e instanceof SigningRejectedError) {
        setStatus("Wallet rejected the EIP-712 authorization.");
      } else {
        setStatus(e instanceof Error ? e.message : "Authorization failed.");
      }
    }
  }

  async function handleWrap() {
    setStatus(null);
    try {
      const amount = parseUnits(wrapAmount || "0", decimals);
      const result = await shield.mutateAsync({ amount });
      setStatus(`Wrapped successfully. Tx: ${result.txHash}`);
      await refetchBalance();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Wrap failed.");
    }
  }

  async function handleUnwrap() {
    setStatus(null);
    try {
      const result =
        unwrapAmount.trim() === ""
          ? await unshieldAll.mutateAsync()
          : await unshield.mutateAsync({ amount: parseUnits(unwrapAmount, decimals) });
      setStatus(`Unwrap submitted. Tx: ${result.txHash}`);
      await refetchBalance();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Unwrap failed.");
    }
  }

  return (
    <section className="panel">
      <p>
        <Link to="/">← Registry</Link>
      </p>

      <div className="panel-header">
        <div>
          <h2>
            {underlyingMeta?.symbol ?? "…"} → {confidentialMeta?.symbol ?? "…"}
          </h2>
          <p className="muted">
            Wrap public ERC-20 into confidential ERC-7984, decrypt your balance, or unshield back.
          </p>
        </div>
        <ConnectWallet />
      </div>

      <div className="pair-status">
        <span className={valid ? "badge ok" : "badge revoked"}>{valid ? "Registry valid" : "Revoked"}</span>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="label">Underlying</span>
          <AddressLink chainId={activeChainId} address={underlying} />
        </div>
        <div className="info-card">
          <span className="label">Confidential wrapper</span>
          <AddressLink chainId={activeChainId} address={confidential} />
        </div>
      </div>

      {!isConnected && <p className="status">Connect a wallet on Sepolia or mainnet to continue.</p>}

      {isConnected && (
        <div className="action-grid">
          <article className="action-card">
            <h3>Balances</h3>
            <dl className="balance-dl">
              <dt>Public {underlyingMeta?.symbol}</dt>
              <dd>
                {publicBalance !== undefined
                  ? formatUnits(publicBalance as bigint, decimals)
                  : "—"}
              </dd>
              <dt>Confidential {confidentialMeta?.symbol}</dt>
              <dd>
                {!isAllowed
                  ? "Authorize decryption first"
                  : balanceLoading
                    ? "Decrypting…"
                    : confidentialBalance !== undefined
                      ? formatUnits(confidentialBalance, decimals)
                      : "—"}
              </dd>
            </dl>
            <button
              type="button"
              className="btn primary"
              onClick={handleAuthorizeDecrypt}
              disabled={allow.isPending}
            >
              {allow.isPending ? "Signing EIP-712…" : isAllowed ? "Re-authorize decrypt" : "Authorize decrypt (EIP-712)"}
            </button>
          </article>

          <article className="action-card">
            <h3>Wrap (shield)</h3>
            <label>
              Amount ({underlyingMeta?.symbol ?? "tokens"})
              <input
                type="text"
                value={wrapAmount}
                onChange={(e) => setWrapAmount(e.target.value)}
                placeholder="100"
              />
            </label>
            <button
              type="button"
              className="btn primary"
              onClick={handleWrap}
              disabled={!valid || shield.isPending}
            >
              {shield.isPending ? "Wrapping…" : "Wrap to confidential"}
            </button>
          </article>

          <article className="action-card">
            <h3>Unwrap (unshield)</h3>
            <label>
              Amount (leave empty for full balance)
              <input
                type="text"
                value={unwrapAmount}
                onChange={(e) => setUnwrapAmount(e.target.value)}
                placeholder="optional"
              />
            </label>
            <button
              type="button"
              className="btn primary"
              onClick={handleUnwrap}
              disabled={!valid || unshield.isPending || unshieldAll.isPending}
            >
              {unshield.isPending || unshieldAll.isPending ? "Unshielding…" : "Unwrap to ERC-20"}
            </button>
            <p className="muted small">Runs unwrap + finalize via the Zama SDK.</p>
          </article>
        </div>
      )}

      {status && <p className="status">{status}</p>}
    </section>
  );
}
