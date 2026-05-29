import {
  useTokenPairsLength,
  useZamaSDK,
  type TokenWrapperPairWithMetadata,
} from "@zama-fhe/react-sdk";
import { useQuery } from "@tanstack/react-query";

export function useAllRegistryPairs(options?: { enabled?: boolean }) {
  const sdk = useZamaSDK();
  const { data: total } = useTokenPairsLength();
  const enabled = (options?.enabled ?? true) && total !== undefined;

  return useQuery({
    queryKey: ["registry", "all-pairs-metadata", total?.toString()],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<TokenWrapperPairWithMetadata[]> => {
      const totalN = Number(total ?? 0n);
      if (totalN === 0) return [];
      const pageSize = 100;
      const pages = Math.ceil(totalN / pageSize);
      const all: TokenWrapperPairWithMetadata[] = [];
      for (let page = 1; page <= pages; page++) {
        const result = await sdk.registry.listPairs({
          page,
          pageSize,
          metadata: true,
        });
        for (const item of result.items) {
          if ("underlying" in item) {
            all.push(item as TokenWrapperPairWithMetadata);
          }
        }
      }
      return all;
    },
  });
}
