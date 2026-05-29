import { explorerTx } from "../config";

type Props = {
  chainId: number;
  hash: string;
};

export default function TxLink({ chainId, hash }: Props) {
  return (
    <a
      href={explorerTx(chainId, hash)}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-white underline-offset-2 hover:text-white/80"
    >
      view tx
    </a>
  );
}
