import { useState } from "react";
import { contractConfigured } from "../config";

/**
 * TODO (cloud agent): wire @zama-fhe/relayer-sdk + wagmi
 * 1. Upload file → IPFS → documentCid
 * 2. createEncryptedInput(contract, user).addAddress(reporter).add32(riskTier).encrypt()
 * 3. submit(documentCid, handles[0], handles[1], inputProof)
 */
export default function Submit() {
  const [file, setFile] = useState<File | null>(null);
  const [riskTier, setRiskTier] = useState("3");
  const [status, setStatus] = useState("UI stub — connect wallet and Relayer SDK to submit.");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus("Select a document first.");
      return;
    }
    if (!contractConfigured) {
      setStatus("Set VITE_CONTRACT_ADDRESS in packages/web/.env after deploying contracts.");
      return;
    }
    setStatus(
      `Ready to implement:\n• IPFS upload for "${file.name}"\n• Encrypt reporter + risk tier ${riskTier}\n• Call ConfidentialWhistleblower.submit()`,
    );
  }

  return (
    <div className="card">
      <h2>Submit report</h2>
      <p className="hint">
        The document CID will be public on-chain. Your identity and risk tier are encrypted with FHEVM.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="file">Document</label>
        <input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <label htmlFor="risk">Risk tier (encrypted, 1–5)</label>
        <select id="risk" value={riskTier} onChange={(e) => setRiskTier(e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
        <button type="submit">Submit (stub)</button>
      </form>
      <div className="status">{status}</div>
    </div>
  );
}
