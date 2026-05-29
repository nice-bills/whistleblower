import { parseUnits } from "viem";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import AddressLink from "../components/AddressLink";
import PageShell from "../components/PageShell";
import StatusMessage from "../components/StatusMessage";
import TxLink from "../components/TxLink";
import {
  DEFAULT_FAUCET_MINT_UNITS,
  MINT_ABI,
  SEPOLIA_MOCK_FAUCET_TOKENS,
} from "../constants/sepolia-mocks";

type StatusState =
  | { variant: "success"; message: string; txHash: string }
  | { variant: "error"; message: string }
  | null;

export default function Faucet() {
  const { address, chainId, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState<StatusState>(null);
  const onSepolia = chainId === sepolia.id;

  async function mintToken(token: (typeof SEPOLIA_MOCK_FAUCET_TOKENS)[number]) {
    if (!address) return;
    setStatus(null);
    try {
      const amount = parseUnits(DEFAULT_FAUCET_MINT_UNITS.toString(), token.decimals);
      const hash = await writeContractAsync({
        chainId: sepolia.id,
        address: token.underlying,
        abi: MINT_ABI,
        functionName: "mint",
        args: [address, amount],
      });
      setStatus({
        variant: "success",
        message: `minted ${DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} ${token.symbol} underlying.`,
        txHash: hash,
      });
    } catch (e) {
      setStatus({
        variant: "error",
        message: e instanceof Error ? e.message : "mint failed.",
      });
    }
  }

  return (
    <PageShell
      title="mock faucet"
      description="mint official ctokenmock underlyings on sepolia, then wrap through any registry pair."
    >
      {!isConnected && (
        <StatusMessage variant="info">connect a wallet to mint test tokens.</StatusMessage>
      )}
      {isConnected && !onSepolia && (
        <StatusMessage variant="warn">switch to sepolia. mock mint is testnet only.</StatusMessage>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SEPOLIA_MOCK_FAUCET_TOKENS.map((token) => (
          <article
            key={token.underlying}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-5 backdrop-blur"
          >
            <p className="text-2xl font-medium lowercase text-white">{token.symbol}</p>
            <p className="text-sm text-white/60">{token.name}</p>
            <p className="text-xs text-white/50">
              underlying <AddressLink chainId={sepolia.id} address={token.underlying} />
            </p>
            <p className="text-xs text-white/50">
              wrapper{" "}
              <Link
                to={`/pair/${token.confidential}`}
                className="font-mono text-white/70 hover:text-white"
              >
                {token.confidential.slice(0, 10)}…
              </Link>
            </p>
            <button
              type="button"
              className="mt-auto rounded-full bg-white py-2.5 text-sm text-black transition-colors hover:bg-neutral-200 disabled:opacity-40"
              disabled={!isConnected || !onSepolia || isPending}
              onClick={() => mintToken(token)}
            >
              mint {DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} {token.symbol}
            </button>
          </article>
        ))}
      </div>

      {status?.variant === "success" && (
        <StatusMessage variant="success">
          {status.message} <TxLink chainId={sepolia.id} hash={status.txHash} />
        </StatusMessage>
      )}
      {status?.variant === "error" && <StatusMessage variant="error">{status.message}</StatusMessage>}

      <Link
        to="/"
        className="mt-10 inline-block text-sm text-white/60 transition-colors hover:text-white"
      >
        ← back to registry
      </Link>
    </PageShell>
  );
}
