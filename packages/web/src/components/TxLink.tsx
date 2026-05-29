import { explorerTx } from "../config";

type Props = {
  chainId: number;
  hash: string;
};

export default function TxLink({ chainId, hash }: Props) {
  const short = `${hash.slice(0, 10)}…${hash.slice(-8)}`;
  return (
    <a href={explorerTx(chainId, hash)} target="_blank" rel="noreferrer" className="tx-link">
      {short}
    </a>
  );
}
