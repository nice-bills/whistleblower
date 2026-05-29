import { loadPendingUnshield, useResumeUnshield, useZamaSDK } from "@zama-fhe/react-sdk";
import { useEffect, useState } from "react";
import StatusMessage from "./StatusMessage";
import TxLink from "./TxLink";
import { formatTxError } from "../lib/errors";
import { pushTxActivity } from "../lib/storage";

type Props = {
  confidential: `0x${string}`;
  chainId: number;
  onDone?: () => void;
};

export default function UnshieldPending({ confidential, chainId, onDone }: Props) {
  const sdk = useZamaSDK();
  const [pendingHash, setPendingHash] = useState<`0x${string}` | null>(null);
  const resume = useResumeUnshield({
    tokenAddress: confidential,
    wrapperAddress: confidential,
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPendingUnshield(sdk.storage, confidential).then((hash) => {
      if (!cancelled) setPendingHash(hash);
    });
    return () => {
      cancelled = true;
    };
  }, [sdk.storage, confidential]);

  if (!pendingHash) return null;

  async function handleResume() {
    setStatus(null);
    try {
      const result = await resume.mutateAsync({ unwrapTxHash: pendingHash! });
      pushTxActivity({
        chainId,
        hash: result.txHash,
        label: "resume unshield",
        at: Date.now(),
      });
      setStatus("success");
      setPendingHash(null);
      onDone?.();
    } catch (e) {
      setStatus(formatTxError(e));
    }
  }

  return (
    <StatusMessage variant="warn">
      <p>an unwrap is pending finalization.</p>
      <p className="mt-1 font-mono text-xs break-all">{pendingHash}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={resume.isPending}
          onClick={handleResume}
          className="rounded-full bg-white px-4 py-2 text-xs text-black hover:bg-neutral-200 disabled:opacity-50"
        >
          {resume.isPending ? "finalizing…" : "resume unshield"}
        </button>
        <TxLink chainId={chainId} hash={pendingHash} />
      </div>
      {status && status !== "success" && (
        <p className="mt-2 text-white/80">{status}</p>
      )}
    </StatusMessage>
  );
}
