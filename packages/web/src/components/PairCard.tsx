import { Link } from "react-router-dom";
import AddressLink from "./AddressLink";
import FavoriteButton from "./FavoriteButton";
import type { RegistryPairItem } from "../lib/pairSearch";

type Props = {
  pair: RegistryPairItem;
  chainId: number;
};

export default function PairCard({ pair, chainId }: Props) {
  return (
    <article className="pill-surface flex flex-col gap-4 rounded-2xl p-5 transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-medium lowercase text-white">
            {pair.underlying.symbol}
            <span className="text-white/50"> → </span>
            {pair.confidential.symbol}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {pair.underlying.name} · {pair.confidential.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton confidentialAddress={pair.confidentialTokenAddress} />
          <span
            className={[
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              pair.isValid
                ? "bg-white/15 text-white"
                : "bg-white/5 text-white/50 line-through",
            ].join(" ")}
          >
            {pair.isValid ? "valid" : "revoked"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <AddressLink chainId={chainId} address={pair.tokenAddress} />
        <AddressLink chainId={chainId} address={pair.confidentialTokenAddress} />
      </div>
      <Link
        to={`/pair/${pair.confidentialTokenAddress}`}
        state={{ pair }}
        className="mt-auto rounded-full bg-white py-2.5 text-center text-sm text-black transition-colors hover:bg-neutral-200"
      >
        open pair
      </Link>
    </article>
  );
}
