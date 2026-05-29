import { loadTxActivity } from "../lib/storage";
import TxLink from "./TxLink";

export default function TxActivityList({ chainId }: { chainId: number }) {
  const items = loadTxActivity().filter((e) => e.chainId === chainId).slice(0, 8);
  if (items.length === 0) return null;

  return (
    <div className="pill-surface rounded-2xl p-5">
      <h3 className="text-sm font-medium text-white">recent activity</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.hash} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/60">{item.label}</span>
            <TxLink chainId={item.chainId} hash={item.hash} />
          </li>
        ))}
      </ul>
    </div>
  );
}
