import { explorerAddress } from "../config";

type Props = {
  chainId: number;
  address: string;
  label?: string;
};

export default function AddressLink({ chainId, address, label }: Props) {
  const text = label ?? `${address.slice(0, 6)}…${address.slice(-4)}`;
  return (
    <a
      href={explorerAddress(chainId, address)}
      target="_blank"
      rel="noreferrer"
      className="mono-link"
      title={address}
    >
      {text}
    </a>
  );
}
