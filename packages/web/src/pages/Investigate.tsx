import { useState } from "react";
import { contractConfigured } from "../config";

/**
 * TODO (cloud agent): investigator flow
 * 1. Connect wallet; check investigators(address)
 * 2. List submissions from SubmissionCreated events
 * 3. For shared submissions: userDecryptEaddress / userDecryptEuint via relayer SDK
 */
export default function Investigate() {
  const [submissionId, setSubmissionId] = useState("0");
  const [status, setStatus] = useState(
    "UI stub — owner must call shareSubmissionWithInvestigator before decrypt works.",
  );

  function handleDecrypt() {
    if (!contractConfigured) {
      setStatus("Set VITE_CONTRACT_ADDRESS in packages/web/.env");
      return;
    }
    setStatus(
      `Ready to implement user-decrypt for submission #${submissionId}.\nSee packages/contracts/test/ConfidentialWhistleblower.ts for mock pattern.`,
    );
  }

  return (
    <div className="card">
      <h2>Investigator console</h2>
      <p className="hint">
        Only allowlisted investigators can decrypt metadata after the owner shares a submission.
      </p>
      <label htmlFor="id">Submission ID</label>
      <input
        id="id"
        type="number"
        min={0}
        value={submissionId}
        onChange={(e) => setSubmissionId(e.target.value)}
      />
      <button type="button" onClick={handleDecrypt}>
        Decrypt metadata (stub)
      </button>
      <div className="status">{status}</div>
    </div>
  );
}
