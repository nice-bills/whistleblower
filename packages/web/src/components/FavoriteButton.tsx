import { useState } from "react";
import { isFavoritePair, toggleFavoritePair } from "../lib/storage";

export default function FavoriteButton({ confidentialAddress }: { confidentialAddress: string }) {
  const [fav, setFav] = useState(() => isFavoritePair(confidentialAddress));

  function toggle() {
    toggleFavoritePair(confidentialAddress);
    setFav(isFavoritePair(confidentialAddress));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={fav ? "remove from favorites" : "add to favorites"}
      className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:text-white"
    >
      {fav ? "★" : "☆"}
    </button>
  );
}
