import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { MAINNET_RPC, REGISTRY_ADDRESSES, SEPOLIA_RPC } from "../config";
import { REGISTRY_READ_ABI } from "../lib/registryAbi";

async function readPairCount(chainId: 1 | 11155111): Promise<bigint> {
  const chain = chainId === 1 ? mainnet : sepolia;
  const rpc = chainId === 1 ? MAINNET_RPC : SEPOLIA_RPC;
  const client = createPublicClient({ chain, transport: http(rpc) });
  return client.readContract({
    address: REGISTRY_ADDRESSES[chainId],
    abi: REGISTRY_READ_ABI,
    functionName: "getTokenConfidentialTokenPairsLength",
  });
}

export function useDualNetworkStats() {
  return useQuery({
    queryKey: ["registry", "dual-network-stats"],
    staleTime: 120_000,
    queryFn: async () => {
      const [sepoliaCount, mainnetCount] = await Promise.all([
        readPairCount(11155111),
        readPairCount(1),
      ]);
      return { sepolia: sepoliaCount, mainnet: mainnetCount };
    },
  });
}
