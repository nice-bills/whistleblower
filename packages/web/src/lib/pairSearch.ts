import type { TokenWrapperPairWithMetadata } from "@zama-fhe/react-sdk";

export type RegistryPairItem = TokenWrapperPairWithMetadata;

export function filterPairs(
  items: RegistryPairItem[],
  query: string,
  validOnly: boolean,
): RegistryPairItem[] {
  let list = items;
  if (validOnly) list = list.filter((p) => p.isValid);
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((pair) => {
    const hay = [
      pair.underlying.symbol,
      pair.underlying.name,
      pair.confidential.symbol,
      pair.confidential.name,
      pair.tokenAddress,
      pair.confidentialTokenAddress,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function sortPairs(
  items: RegistryPairItem[],
  sort: "symbol" | "valid-first" | "favorites",
  favorites: string[],
): RegistryPairItem[] {
  const favSet = new Set(favorites.map((a) => a.toLowerCase()));
  const copy = [...items];
  copy.sort((a, b) => {
    if (sort === "favorites") {
      const af = favSet.has(a.confidentialTokenAddress.toLowerCase()) ? 0 : 1;
      const bf = favSet.has(b.confidentialTokenAddress.toLowerCase()) ? 0 : 1;
      if (af !== bf) return af - bf;
    }
    if (sort === "valid-first" && a.isValid !== b.isValid) {
      return a.isValid ? -1 : 1;
    }
    const symA = a.underlying.symbol.toLowerCase();
    const symB = b.underlying.symbol.toLowerCase();
    return symA.localeCompare(symB);
  });
  return copy;
}
