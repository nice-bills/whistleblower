import { useAllow, useConfidentialBalance, useIsAllowed, useShield } from "@zama-fhe/react-sdk";
import { parseUnits } from "viem";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAccount, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import PageShell from "../components/PageShell";
import StatusMessage from "../components/StatusMessage";
import TxLink from "../components/TxLink";
import {
  DEFAULT_FAUCET_MINT_UNITS,
  MINT_ABI,
  SEPOLIA_MOCK_FAUCET_TOKENS,
} from "../constants/sepolia-mocks";
import { formatTxError } from "../lib/errors";
import { pushTxActivity } from "../lib/storage";

const STEPS = ["mint", "wrap", "decrypt", "done"] as const;

export default function GettingStarted() {
  const [params] = useSearchParams();
  const initialToken = params.get("token") ?? SEPOLIA_MOCK_FAUCET_TOKENS[0].underlying;
  const mock =
    SEPOLIA_MOCK_FAUCET_TOKENS.find(
      (t) => t.underlying.toLowerCase() === initialToken.toLowerCase(),
    ) ?? SEPOLIA_MOCK_FAUCET_TOKENS[0];

  const { address, chainId, isConnected } = useAccount();
  const { writeContractAsync, isPending: minting } = useWriteContract();
  const [step, setStep] = useState(0);
  const [wrapAmount, setWrapAmount] = useState("1000");
  const [status, setStatus] = useState<{ variant: "success" | "error" | "info"; text: string; hash?: string } | null>(
    null,
  );

  const confidential = mock.confidential;
  const onSepolia = chainId === sepolia.id;

  const { data: isAllowed } = useIsAllowed({ contractAddresses: [confidential] });
  const allow = useAllow();
  const { data: balance, refetch: refetchBalance } = useConfidentialBalance(
    { tokenAddress: confidential },
    { enabled: isConnected && Boolean(isAllowed) },
  );
  const shield = useShield({
    tokenAddress: confidential,
    wrapperAddress: confidential,
    optimistic: true,
  });

  const stepId = STEPS[Math.min(step, STEPS.length - 1)];

  async function mint() {
    if (!address) return;
    setStatus(null);
    try {
      const amount = parseUnits(DEFAULT_FAUCET_MINT_UNITS.toString(), mock.decimals);
      const hash = await writeContractAsync({
        chainId: sepolia.id,
        address: mock.underlying,
        abi: MINT_ABI,
        functionName: "mint",
        args: [address, amount],
      });
      pushTxActivity({ chainId: sepolia.id, hash, label: "faucet mint", at: Date.now() });
      setStatus({ variant: "success", text: `Minted ${DEFAULT_FAUCET_MINT_UNITS} ${mock.symbol}.`, hash });
      setStep(1);
    } catch (e) {
      setStatus({ variant: "error", text: formatTxError(e) });
    }
  }

  async function wrap() {
    setStatus(null);
    try {
      const amount = parseUnits(wrapAmount || "0", mock.decimals);
      const result = await shield.mutateAsync({ amount });
      pushTxActivity({
        chainId: sepolia.id,
        hash: result.txHash,
        label: "guided wrap",
        at: Date.now(),
      });
      setStatus({ variant: "success", text: "Wrapped to confidential balance.", hash: result.txHash });
      setStep(2);
    } catch (e) {
      setStatus({ variant: "error", text: formatTxError(e) });
    }
  }

  async function authorize() {
    setStatus(null);
    try {
      await allow.mutateAsync([confidential]);
      await refetchBalance();
      setStatus({ variant: "success", text: "EIP-712 signed — confidential balance decrypted." });
      setStep(3);
    } catch (e) {
      setStatus({ variant: "error", text: formatTxError(e) });
    }
  }

  const balanceLabel = useMemo(() => {
    if (!isAllowed) return "sign to view";
    if (balance === undefined) return "…";
    return balance.toString();
  }, [balance, isAllowed]);

  return (
    <PageShell
      title="getting started"
      description="a guided path on sepolia: mint mock tokens, wrap into erc-7984, and decrypt your balance with eip-712."
    >
      {!isConnected && (
        <StatusMessage variant="info">connect a wallet to run the guided flow.</StatusMessage>
      )}
      {isConnected && !onSepolia && (
        <StatusMessage variant="warn">switch to sepolia for the guided testnet flow.</StatusMessage>
      )}

      <ol className="mb-8 space-y-2 text-sm text-white/50">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={i === step ? "text-white" : i < step ? "text-white/70" : undefined}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="pill-surface max-w-xl rounded-2xl p-6">
        <p className="text-lg font-medium text-white">
          {mock.symbol} → confidential
        </p>
        <p className="mt-1 text-sm text-white/60">{mock.name}</p>

        {stepId === "mint" && (
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-white py-3 text-sm text-black hover:bg-neutral-200 disabled:opacity-40"
            disabled={!isConnected || !onSepolia || minting}
            onClick={mint}
          >
            {minting ? "minting…" : `mint ${DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} ${mock.symbol}`}
          </button>
        )}

        {stepId === "wrap" && (
          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              placeholder="amount to wrap"
            />
            <button
              type="button"
              className="w-full rounded-full bg-white py-3 text-sm text-black hover:bg-neutral-200 disabled:opacity-40"
              disabled={shield.isPending}
              onClick={wrap}
            >
              {shield.isPending ? "wrapping…" : "wrap to confidential"}
            </button>
          </div>
        )}

        {stepId === "decrypt" && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-white/70">
              authorize decryption to read your erc-7984 balance locally.
            </p>
            <button
              type="button"
              className="w-full rounded-full bg-white py-3 text-sm text-black hover:bg-neutral-200 disabled:opacity-40"
              disabled={allow.isPending}
              onClick={authorize}
            >
              {allow.isPending ? "signing eip-712…" : "authorize & show balance"}
            </button>
          </div>
        )}

        {stepId === "done" && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-white/80">
              confidential balance (raw): <span className="font-mono">{balanceLabel}</span>
            </p>
            <Link
              to={`/pair/${confidential}`}
              className="inline-block rounded-full border border-white/20 px-5 py-2.5 text-sm text-white hover:bg-white/10"
            >
              open pair page →
            </Link>
          </div>
        )}
      </div>

      {status && (
        <StatusMessage variant={status.variant}>
          {status.text}
          {status.hash && (
            <>
              {" "}
              <TxLink chainId={sepolia.id} hash={status.hash} />
            </>
          )}
        </StatusMessage>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/faucet" className="text-white/60 hover:text-white">
          all faucet tokens
        </Link>
        <Link to="/portfolio" className="text-white/60 hover:text-white">
          portfolio →
        </Link>
      </div>
    </PageShell>
  );
}
