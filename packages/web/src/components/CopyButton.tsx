import { useState } from "react";

type Props = {
  text: string;
  label?: string;
};

export default function CopyButton({ text, label = "Copy address" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      className="copy-btn"
      onClick={handleCopy}
      aria-label={label}
      title={copied ? "Copied" : label}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
