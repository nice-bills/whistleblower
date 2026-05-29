const RECENT_KEY = "cwr-recent-pairs";
const FAVORITES_KEY = "cwr-favorite-pairs";
const ACTIVITY_KEY = "cwr-tx-activity";
const MAX_RECENT = 8;
const MAX_ACTIVITY = 30;

export type TxActivity = {
  chainId: number;
  hash: string;
  label: string;
  at: number;
};

export function loadRecentPairs(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentPair(confidentialAddress: string) {
  const key = confidentialAddress.toLowerCase();
  const list = loadRecentPairs().filter((a) => a.toLowerCase() !== key);
  list.unshift(confidentialAddress);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function loadFavoritePairs(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavoritePair(confidentialAddress: string): string[] {
  const key = confidentialAddress.toLowerCase();
  const set = new Set(loadFavoritePairs().map((a) => a.toLowerCase()));
  if (set.has(key)) set.delete(key);
  else set.add(key);
  const next = [...set];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function isFavoritePair(confidentialAddress: string): boolean {
  const key = confidentialAddress.toLowerCase();
  return loadFavoritePairs().some((a) => a.toLowerCase() === key);
}

export function loadTxActivity(): TxActivity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as TxActivity[]) : [];
  } catch {
    return [];
  }
}

export function pushTxActivity(entry: TxActivity) {
  const list = loadTxActivity().filter((e) => e.hash !== entry.hash);
  list.unshift(entry);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, MAX_ACTIVITY)));
}
