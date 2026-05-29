import { parseUnits } from "viem";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import AddressLink from "../components/AddressLink";
import ConnectWallet from "../components/ConnectWallet";
import {
  DEFAULT_FAUCET_MINT_UNITS,
  MINT_ABI,
  SEPOLIA_MOCK_FAUCET_TOKENS,
} from "../constants/sepolia-mocks";

export default function Faucet() {
  const { address, chainId, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState<string | null>(null);
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
      setStatus(`Minted ${DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} ${token.symbol} (underlying). Tx: ${hash}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Mint failed.");
    }
  }

  return (
    <section className="panel">
      <p>
        <Link to="/">← Registry</Link>
      </p>

      <div className="panel-header">
        <div>
          <h2>Sepolia cTokenMock faucet</h2>
          <p className="muted">
            Mint official mock underlying ERC-20s (up to 1M per call on-chain), then wrap them in the
            registry.
          </p>
        </div>
        <ConnectWallet />
      </div>

      {!isConnected && <p className="status">Connect a wallet to mint test tokens.</p>}
      {isConnected && !onSepolia && (
        <p className="status warn">Switch to Sepolia — mock mint is only available on testnet.</p>
      )}

      <div className="faucet-grid">
        {SEPOLIA_MOCK_FAUCET_TOKENS.map((token) => (
          <article key={token.underlying} className="faucet-card">
            <h3>{token.name}</h3>
            <p className="muted small">
              Underlying <AddressLink chainId={sepolia.id} address={token.underlying} />
            </p>
            <p className="muted small">
              Wrapper{" "}
              <Link className="link" to={`/pair/${token.confidential}`}>
                {token.confidential.slice(0, 10)}…
              </Link>
            </p>
            <button
              type="button"
              className="btn primary"
              disabled={!isConnected || !onSepolia || isPending}
              onClick={() => mintToken(token)}
            >
              Mint {DEFAULT_FAUCET_MINT_UNITS.toLocaleString()} {token.symbol}
            </button>
          </article>
        ))}
      </div>

      {status && <p className="status">{status}</p>}
    </section>
  );
}
