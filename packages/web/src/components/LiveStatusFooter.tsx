import { useAccount } from "wagmi";
import { chainLabel, isSupportedChainId } from "../config";

export default function LiveStatusFooter() {
  const { chainId, isConnected } = useAccount();
  const network =
    isConnected && chainId !== undefined && isSupportedChainId(chainId)
      ? chainLabel(chainId)
      : "not connected";

  return (
    <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-white/35">
      <span>@zama-fhe/react-sdk 3.x</span>
      <span>relayer v2</span>
      <span>wallet: {network.toLowerCase()}</span>
    </div>
  );
}
