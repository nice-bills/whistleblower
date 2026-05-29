import { parseUnits } from "viem";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import AddressLink from "../components/AddressLink";
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
        message: `Minted ${DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} ${token.symbol} underlying.`,
        txHash: hash,
      });
    } catch (e) {
      setStatus({
        variant: "error",
        message: e instanceof Error ? e.message : "Mint failed.",
      });
    }
  }

  return (
    <>
      <header className="page-hero">
        <p className="page-hero__eyebrow">Sepolia testnet</p>
        <h1 className="page-hero__title">Mock token faucet.</h1>
        <p className="page-hero__lede">
          Mint official cTokenMock underlyings, then wrap them through any registry pair. One click
          per token — up to 10,000 units each.
        </p>
      </header>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">cTokenMock underlyings</h2>
            <p className="panel__desc">Public mint on Sepolia only. Switch network in the header if needed.</p>
          </div>
        </div>

        {!isConnected && (
          <StatusMessage variant="info">Connect a wallet in the header to mint test tokens.</StatusMessage>
        )}
        {isConnected && !onSepolia && (
          <StatusMessage variant="warn">Switch to Sepolia — mock mint is only available on testnet.</StatusMessage>
        )}

        <div className="faucet-grid">
          {SEPOLIA_MOCK_FAUCET_TOKENS.map((token) => (
            <article key={token.underlying} className="faucet-card">
              <h3 className="faucet-card__name">{token.name}</h3>
              <p className="faucet-card__meta">
                Underlying · <AddressLink chainId={sepolia.id} address={token.underlying} />
              </p>
              <p className="faucet-card__meta">
                Wrapper ·{" "}
                <Link to={`/pair/${token.confidential}`} className="mono-link">
                  {token.confidential.slice(0, 10)}…
                </Link>
              </p>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!isConnected || !onSepolia || isPending}
                onClick={() => mintToken(token)}
              >
                Mint {DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} {token.symbol}
              </button>
            </article>
          ))}
        </div>

        {status?.variant === "success" && (
          <StatusMessage variant="success">
            {status.message}{" "}
            <TxLink chainId={sepolia.id} hash={status.txHash} />
          </StatusMessage>
        )}
        {status?.variant === "error" && <StatusMessage variant="error">{status.message}</StatusMessage>}
      </section>

      <p style={{ marginTop: "1.5rem" }}>
        <Link to="/" className="page-back">
          ← Back to registry
        </Link>
      </p>
    </>
  );
}
