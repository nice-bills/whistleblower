import { useState } from "react";

export default function CopyButton({ text, label = "copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:text-white"
    >
      {copied ? "copied" : label}
    </button>
  );
}
