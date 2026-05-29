import type { RegistryPairItem } from "../lib/pairSearch";

export default function ExportPairsButton({ pairs }: { pairs: RegistryPairItem[] }) {
  function download() {
    const payload = pairs.map((p) => ({
      underlying: p.tokenAddress,
      confidential: p.confidentialTokenAddress,
      isValid: p.isValid,
      underlyingSymbol: p.underlying.symbol,
      confidentialSymbol: p.confidential.symbol,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wrapper-registry-pairs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={pairs.length === 0}
      className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:text-white disabled:opacity-40"
    >
      export json
    </button>
  );
}
